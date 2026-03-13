import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Appointment } from '../../entities/appointment.entity';
import { Location } from '../../entities/location.entity';
import { Doctor } from '../../entities/doctor.entity';
import axios from 'axios';

enum BookingState {
  IDLE = 'IDLE',
  SELECT_BRANCH = 'SELECT_BRANCH',
  SELECT_DOCTOR = 'SELECT_DOCTOR',
  SELECT_DATE = 'SELECT_DATE',
  SELECT_TIME = 'SELECT_TIME',
  CONFIRMING = 'CONFIRMING',
}

interface UserSession {
  state: BookingState;
  patientId?: number;
  locationId?: number;
  doctorId?: number;
  date?: string;
  time?: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private sessions = new Map<string, UserSession>();

  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async handleIncomingMessage(from: string, text: string) {
    const mobile = from.replace(/\D/g, '').slice(-10); // Normalize to 10 digits
    let session = this.sessions.get(from) || { state: BookingState.IDLE };

    this.logger.log(`Received message from ${from}: ${text} (State: ${session.state})`);

    try {
      if (text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
        return this.handleGreeting(from, mobile);
      }

      switch (session.state) {
        case BookingState.SELECT_BRANCH:
          return this.handleBranchSelection(from, text, session);
        case BookingState.SELECT_DOCTOR:
          return this.handleDoctorSelection(from, text, session);
        case BookingState.SELECT_DATE:
          return this.handleDateSelection(from, text, session);
        case BookingState.SELECT_TIME:
          return this.handleTimeSelection(from, text, session);
        default:
          return this.sendMessage(from, "Welcome! Please type 'Hi' to start booking an appointment.");
      }
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      return this.sendMessage(from, "Sorry, something went wrong. Please try again later.");
    }
  }

  private async handleGreeting(from: string, mobile: string) {
    const patient = await this.patientRepository.findOne({ where: { mobile: mobile } });

    if (!patient) {
      return this.sendMessage(from, "Welcome! We couldn't find your record. Please register at the hospital first.");
    }

    const session: UserSession = { state: BookingState.SELECT_BRANCH, patientId: patient.id };
    this.sessions.set(from, session);

    const locations = await this.locationRepository.find({ where: { isActive: true } });
    let message = `Hello ${patient.first_name} ${patient.last_name}!\n\nPlease select a branch for your appointment:\n`;
    locations.forEach((loc, index) => {
      message += `${index + 1}. ${loc.name}\n`;
    });
    message += "\nReply with the number of your choice.";

    return this.sendMessage(from, message);
  }

  private async handleBranchSelection(from: string, text: string, session: UserSession) {
    const index = parseInt(text) - 1;
    const locations = await this.locationRepository.find({ where: { isActive: true } });

    if (isNaN(index) || index < 0 || index >= locations.length) {
      return this.sendMessage(from, "Invalid selection. Please reply with a valid number from the list.");
    }

    const location = locations[index];
    session.locationId = location.id;
    session.state = BookingState.SELECT_DOCTOR;
    this.sessions.set(from, session);

    const doctors = await this.doctorRepository.find({ where: { location_id: location.id, is_active: true } });
    if (doctors.length === 0) {
      return this.sendMessage(from, "Sorry, no doctors are available at this branch. Please choose another one.");
    }

    let message = `Great! Now select a doctor at ${location.name}:\n`;
    doctors.forEach((doc, idx) => {
      message += `${idx + 1}. ${doc.name} (${doc.specialization || 'General'})\n`;
    });
    message += "\nReply with the number of your choice.";

    return this.sendMessage(from, message);
  }

  private async handleDoctorSelection(from: string, text: string, session: UserSession) {
    const index = parseInt(text) - 1;
    const doctors = await this.doctorRepository.find({ where: { location_id: session.locationId, is_active: true } });

    if (isNaN(index) || index < 0 || index >= doctors.length) {
      return this.sendMessage(from, "Invalid selection. Please reply with a valid number from the list.");
    }

    const doctor = doctors[index];
    session.doctorId = doctor.id;
    session.state = BookingState.SELECT_DATE;
    this.sessions.set(from, session);

    return this.sendMessage(from, "Please enter the date for your appointment (YYYY-MM-DD):");
  }

  private async handleDateSelection(from: string, text: string, session: UserSession) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(text)) {
      return this.sendMessage(from, "Invalid format. Please enter date as YYYY-MM-DD (e.g., 2024-03-15).");
    }

    session.date = text;
    session.state = BookingState.SELECT_TIME;
    this.sessions.set(from, session);

    return this.sendMessage(from, "Please enter the time for your appointment (HH:MM, e.g., 10:30):");
  }

  private async handleTimeSelection(from: string, text: string, session: UserSession) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(text)) {
      return this.sendMessage(from, "Invalid format. Please enter time as HH:MM (e.g., 14:00).");
    }

    session.time = text;
    this.sessions.set(from, session);

    this.logger.log(`Finalizing appointment for patient ${session.patientId} with doctor ${session.doctorId} at ${session.date} ${session.time}`);

    // Create appointment
    try {
      const appointment = new Appointment();
      appointment.appointment_id = `WA${Date.now()}`;
      appointment.patient_id = session.patientId;
      appointment.doctor_id = session.doctorId;
      appointment.appointment_date = session.date;
      appointment.appointment_time = session.time;
      appointment.location_id = session.locationId;
      appointment.status = 'scheduled';
      appointment.appointment_type = 'consultation';
      appointment.appointment_type_id = 1; // Default consultation ID

      this.logger.log(`Saving appointment object: ${JSON.stringify(appointment)}`);
      await this.appointmentRepository.save(appointment);
      this.logger.log(`Appointment saved successfully with ID: ${appointment.id}`);

      const doctor = await this.doctorRepository.findOne({ where: { id: session.doctorId } });
      const location = await this.locationRepository.findOne({ where: { id: session.locationId } });

      const confirmation = `✅ Appointment Booked Successfully!\n\n` +
        `ID: ${appointment.appointment_id}\n` +
        `Doctor: ${doctor.name}\n` +
        `Branch: ${location.name}\n` +
        `Date: ${session.date}\n` +
        `Time: ${session.time}\n\n` +
        `Thank you for booking with us!`;

      this.sessions.delete(from); // Clear session
      return this.sendMessage(from, confirmation);
    } catch (error) {
      this.logger.error(`Failed to save appointment: ${error.message}`);
      return this.sendMessage(from, "Sorry, we couldn't save your appointment. Please contact our support.");
    }
  }

  private async sendMessage(to: string, text: string) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      this.logger.warn(`WhatsApp API credentials not configured. Mocking message to ${to}: ${text}`);
      return { success: true };
    }

    this.logger.log(`Sending message via Meta API to ${to}: ${text}`);

    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Meta API Error: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return { success: false };
    }
  }
}

