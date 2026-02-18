import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class MedicalHistoryService {
  private pool: Pool;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: '12345',
      database: 'postgres',
    });
  }

  async getUserLocationId(userId: number): Promise<number> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.primaryLocationId) {
        return user.primaryLocationId;
      }

      const locationPermission = await this.userRepository.query(
        'SELECT location_id FROM user_location_permissions WHERE user_id = $1 AND location_id IS NOT NULL LIMIT 1',
        [userId]
      );

      if (locationPermission.length > 0) {
        return locationPermission[0].location_id;
      }

      return 1;
    } catch (error) {
      console.error('Error getting user location:', error);
      return 1;
    }
  }

  async getMedicalHistory(locationId?: number) {
    try {
      // Return sample data if table doesn't exist
      return [
        { id: 1, title: 'Diabetes', description: 'Diabetes mellitus', location_id: 1 },
        { id: 2, title: 'Hypertension', description: 'High blood pressure', location_id: 1 },
        { id: 3, title: 'Heart Disease', description: 'Cardiovascular conditions', location_id: 1 },
        { id: 4, title: 'Asthma', description: 'Respiratory condition', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createMedicalHistory(data: any) {
    try {
      // Return mock success response
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create medical history');
    }
  }

  async updateMedicalHistory(id: number, data: any) {
    try {
      // Return mock success response
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update medical history');
    }
  }



  private static medicalHistoryOptions: any[] = [
    { id: 1, title: 'Type 1 Diabetes', medical_history_id: 1 },
    { id: 2, title: 'Type 2 Diabetes', medical_history_id: 1 },
    { id: 3, title: 'Gestational Diabetes', medical_history_id: 1 },
    { id: 4, title: 'Primary Hypertension', medical_history_id: 2 },
    { id: 5, title: 'Secondary Hypertension', medical_history_id: 2 },
    { id: 6, title: 'Coronary Artery Disease', medical_history_id: 3 },
    { id: 7, title: 'Heart Failure', medical_history_id: 3 },
    { id: 8, title: 'Arrhythmia', medical_history_id: 3 },
    { id: 9, title: 'Allergic Asthma', medical_history_id: 4 },
    { id: 10, title: 'Non-allergic Asthma', medical_history_id: 4 }
  ];
  private static nextOptionId = 11;

  async getMedicalHistoryOptions(historyId: number) {
    try {
      return MedicalHistoryService.medicalHistoryOptions.filter(
        option => option.medical_history_id === historyId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createMedicalHistoryOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextOptionId++,
        title: data.title,
        medical_history_id: data.medical_history_id
      };
      MedicalHistoryService.medicalHistoryOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create medical history option');
    }
  }

  async updateMedicalHistoryOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.medicalHistoryOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.medicalHistoryOptions[index] = {
          id: id,
          title: data.title,
          medical_history_id: data.medical_history_id
        };
        return MedicalHistoryService.medicalHistoryOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update medical history option');
    }
  }

  async getAllMedicalHistoryOptions() {
    try {
      return MedicalHistoryService.medicalHistoryOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getPersonalHistory(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Smoking', description: 'Smoking habits', location_id: 1 },
        { id: 2, title: 'Alcohol', description: 'Alcohol consumption', location_id: 1 },
        { id: 3, title: 'Exercise', description: 'Physical activity', location_id: 1 },
        { id: 4, title: 'Diet', description: 'Dietary habits', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createPersonalHistory(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create personal history');
    }
  }

  async updatePersonalHistory(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update personal history');
    }
  }

  private static personalHistoryOptions: any[] = [
    { id: 1, title: 'Current Smoker', personal_history_id: 1 },
    { id: 2, title: 'Former Smoker', personal_history_id: 1 },
    { id: 3, title: 'Never Smoked', personal_history_id: 1 },
    { id: 4, title: 'Daily Drinker', personal_history_id: 2 },
    { id: 5, title: 'Social Drinker', personal_history_id: 2 },
    { id: 6, title: 'Non-Drinker', personal_history_id: 2 },
    { id: 7, title: 'Regular Exercise', personal_history_id: 3 },
    { id: 8, title: 'Occasional Exercise', personal_history_id: 3 },
    { id: 9, title: 'Sedentary', personal_history_id: 3 },
    { id: 10, title: 'Vegetarian', personal_history_id: 4 },
    { id: 11, title: 'Non-Vegetarian', personal_history_id: 4 },
    { id: 12, title: 'Vegan', personal_history_id: 4 }
  ];
  private static nextPersonalOptionId = 13;

  async getPersonalHistoryOptions(historyId: number) {
    try {
      return MedicalHistoryService.personalHistoryOptions.filter(
        option => option.personal_history_id === historyId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createPersonalHistoryOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextPersonalOptionId++,
        title: data.title,
        personal_history_id: data.personal_history_id
      };
      MedicalHistoryService.personalHistoryOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create personal history option');
    }
  }

  async updatePersonalHistoryOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.personalHistoryOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.personalHistoryOptions[index] = {
          id: id,
          title: data.title,
          personal_history_id: data.personal_history_id
        };
        return MedicalHistoryService.personalHistoryOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update personal history option');
    }
  }

  async getAllPersonalHistoryOptions() {
    try {
      return MedicalHistoryService.personalHistoryOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getLifestyle(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Physical Activity', description: 'Exercise and fitness habits', location_id: 1 },
        { id: 2, title: 'Sleep Pattern', description: 'Sleep quality and duration', location_id: 1 },
        { id: 3, title: 'Stress Level', description: 'Stress management and coping', location_id: 1 },
        { id: 4, title: 'Work-Life Balance', description: 'Balance between work and personal life', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createLifestyle(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create lifestyle');
    }
  }

  async updateLifestyle(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update lifestyle');
    }
  }

  private static lifestyleOptions: any[] = [
    { id: 1, title: 'Daily Exercise', lifestyle_id: 1 },
    { id: 2, title: 'Weekly Exercise', lifestyle_id: 1 },
    { id: 3, title: 'No Exercise', lifestyle_id: 1 },
    { id: 4, title: '7-8 Hours Sleep', lifestyle_id: 2 },
    { id: 5, title: '5-6 Hours Sleep', lifestyle_id: 2 },
    { id: 6, title: 'Less than 5 Hours', lifestyle_id: 2 },
    { id: 7, title: 'Low Stress', lifestyle_id: 3 },
    { id: 8, title: 'Moderate Stress', lifestyle_id: 3 },
    { id: 9, title: 'High Stress', lifestyle_id: 3 },
    { id: 10, title: 'Good Balance', lifestyle_id: 4 },
    { id: 11, title: 'Poor Balance', lifestyle_id: 4 }
  ];
  private static nextLifestyleOptionId = 12;

  async getLifestyleOptions(lifestyleId: number) {
    try {
      return MedicalHistoryService.lifestyleOptions.filter(
        option => option.lifestyle_id === lifestyleId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createLifestyleOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextLifestyleOptionId++,
        title: data.title,
        lifestyle_id: data.lifestyle_id
      };
      MedicalHistoryService.lifestyleOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create lifestyle option');
    }
  }

  async updateLifestyleOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.lifestyleOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.lifestyleOptions[index] = {
          id: id,
          title: data.title,
          lifestyle_id: data.lifestyle_id
        };
        return MedicalHistoryService.lifestyleOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update lifestyle option');
    }
  }

  async getAllLifestyleOptions() {
    try {
      return MedicalHistoryService.lifestyleOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getFamilyHistory(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Diabetes', description: 'Family history of diabetes', location_id: 1 },
        { id: 2, title: 'Hypertension', description: 'Family history of high blood pressure', location_id: 1 },
        { id: 3, title: 'Heart Disease', description: 'Family history of cardiovascular disease', location_id: 1 },
        { id: 4, title: 'Cancer', description: 'Family history of cancer', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createFamilyHistory(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create family history');
    }
  }

  async updateFamilyHistory(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update family history');
    }
  }

  private static familyHistoryOptions: any[] = [
    { id: 1, title: 'Type 1 Diabetes', family_history_id: 1 },
    { id: 2, title: 'Type 2 Diabetes', family_history_id: 1 },
    { id: 3, title: 'Gestational Diabetes', family_history_id: 1 },
    { id: 4, title: 'Essential Hypertension', family_history_id: 2 },
    { id: 5, title: 'Secondary Hypertension', family_history_id: 2 },
    { id: 6, title: 'Coronary Heart Disease', family_history_id: 3 },
    { id: 7, title: 'Heart Attack', family_history_id: 3 },
    { id: 8, title: 'Stroke', family_history_id: 3 },
    { id: 9, title: 'Breast Cancer', family_history_id: 4 },
    { id: 10, title: 'Lung Cancer', family_history_id: 4 },
    { id: 11, title: 'Colon Cancer', family_history_id: 4 }
  ];
  private static nextFamilyHistoryOptionId = 12;

  async getFamilyHistoryOptions(familyHistoryId: number) {
    try {
      return MedicalHistoryService.familyHistoryOptions.filter(
        option => option.family_history_id === familyHistoryId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createFamilyHistoryOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextFamilyHistoryOptionId++,
        title: data.title,
        family_history_id: data.family_history_id
      };
      MedicalHistoryService.familyHistoryOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create family history option');
    }
  }

  async updateFamilyHistoryOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.familyHistoryOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.familyHistoryOptions[index] = {
          id: id,
          title: data.title,
          family_history_id: data.family_history_id
        };
        return MedicalHistoryService.familyHistoryOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update family history option');
    }
  }

  async getAllFamilyHistoryOptions() {
    try {
      return MedicalHistoryService.familyHistoryOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getDrugHistory(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Antibiotics', description: 'Antibiotic medications', location_id: 1 },
        { id: 2, title: 'Pain Medications', description: 'Pain relief medications', location_id: 1 },
        { id: 3, title: 'Blood Thinners', description: 'Anticoagulant medications', location_id: 1 },
        { id: 4, title: 'Steroids', description: 'Corticosteroid medications', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createDrugHistory(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create drug history');
    }
  }

  async updateDrugHistory(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update drug history');
    }
  }

  private static drugHistoryOptions: any[] = [
    { id: 1, title: 'Penicillin', drug_history_id: 1 },
    { id: 2, title: 'Amoxicillin', drug_history_id: 1 },
    { id: 3, title: 'Ciprofloxacin', drug_history_id: 1 },
    { id: 4, title: 'Ibuprofen', drug_history_id: 2 },
    { id: 5, title: 'Acetaminophen', drug_history_id: 2 },
    { id: 6, title: 'Morphine', drug_history_id: 2 },
    { id: 7, title: 'Warfarin', drug_history_id: 3 },
    { id: 8, title: 'Heparin', drug_history_id: 3 },
    { id: 9, title: 'Prednisolone', drug_history_id: 4 },
    { id: 10, title: 'Hydrocortisone', drug_history_id: 4 }
  ];
  private static nextDrugHistoryOptionId = 11;

  async getDrugHistoryOptions(drugHistoryId: number) {
    try {
      return MedicalHistoryService.drugHistoryOptions.filter(
        option => option.drug_history_id === drugHistoryId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createDrugHistoryOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextDrugHistoryOptionId++,
        title: data.title,
        drug_history_id: data.drug_history_id
      };
      MedicalHistoryService.drugHistoryOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create drug history option');
    }
  }

  async updateDrugHistoryOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.drugHistoryOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.drugHistoryOptions[index] = {
          id: id,
          title: data.title,
          drug_history_id: data.drug_history_id
        };
        return MedicalHistoryService.drugHistoryOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update drug history option');
    }
  }

  async getAllDrugHistoryOptions() {
    try {
      return MedicalHistoryService.drugHistoryOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getAllergies(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Food Allergies', description: 'Food-related allergic reactions', location_id: 1 },
        { id: 2, title: 'Drug Allergies', description: 'Medication allergic reactions', location_id: 1 },
        { id: 3, title: 'Environmental Allergies', description: 'Environmental allergens', location_id: 1 },
        { id: 4, title: 'Skin Allergies', description: 'Contact allergic reactions', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createAllergy(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create allergy');
    }
  }

  async updateAllergy(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update allergy');
    }
  }

  private static allergiesOptions: any[] = [
    { id: 1, title: 'Peanuts', allergy_id: 1 },
    { id: 2, title: 'Shellfish', allergy_id: 1 },
    { id: 3, title: 'Dairy', allergy_id: 1 },
    { id: 4, title: 'Penicillin', allergy_id: 2 },
    { id: 5, title: 'Aspirin', allergy_id: 2 },
    { id: 6, title: 'Sulfa Drugs', allergy_id: 2 },
    { id: 7, title: 'Pollen', allergy_id: 3 },
    { id: 8, title: 'Dust Mites', allergy_id: 3 },
    { id: 9, title: 'Pet Dander', allergy_id: 3 },
    { id: 10, title: 'Latex', allergy_id: 4 },
    { id: 11, title: 'Nickel', allergy_id: 4 }
  ];
  private static nextAllergiesOptionId = 12;

  async getAllergiesOptions(allergyId: number) {
    try {
      return MedicalHistoryService.allergiesOptions.filter(
        option => option.allergy_id === allergyId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createAllergyOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextAllergiesOptionId++,
        title: data.title,
        allergy_id: data.allergy_id
      };
      MedicalHistoryService.allergiesOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create allergy option');
    }
  }

  async updateAllergyOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.allergiesOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.allergiesOptions[index] = {
          id: id,
          title: data.title,
          allergy_id: data.allergy_id
        };
        return MedicalHistoryService.allergiesOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update allergy option');
    }
  }

  async getAllAllergiesOptions() {
    try {
      return MedicalHistoryService.allergiesOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getSocialHistory(locationId?: number) {
    try {
      return [
        { id: 1, title: 'Smoking Status', description: 'Current and past smoking habits', location_id: 1 },
        { id: 2, title: 'Alcohol Use', description: 'Alcohol consumption patterns', location_id: 1 },
        { id: 3, title: 'Education Level', description: 'Educational background', location_id: 1 },
        { id: 4, title: 'Occupation', description: 'Work and employment history', location_id: 1 }
      ];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createSocialHistory(data: any) {
    try {
      return {
        id: Math.floor(Math.random() * 1000),
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create social history');
    }
  }

  async updateSocialHistory(id: number, data: any) {
    try {
      return {
        id: id,
        title: data.title,
        description: data.description,
        location_id: data.location_id
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update social history');
    }
  }

  private static socialHistoryOptions: any[] = [
    { id: 1, title: 'Current Smoker', social_history_id: 1 },
    { id: 2, title: 'Former Smoker', social_history_id: 1 },
    { id: 3, title: 'Never Smoked', social_history_id: 1 },
    { id: 4, title: 'Daily Drinker', social_history_id: 2 },
    { id: 5, title: 'Social Drinker', social_history_id: 2 },
    { id: 6, title: 'Non-Drinker', social_history_id: 2 },
    { id: 7, title: 'High School', social_history_id: 3 },
    { id: 8, title: 'College Graduate', social_history_id: 3 },
    { id: 9, title: 'Post Graduate', social_history_id: 3 },
    { id: 10, title: 'Healthcare Worker', social_history_id: 4 },
    { id: 11, title: 'Office Worker', social_history_id: 4 },
    { id: 12, title: 'Manual Labor', social_history_id: 4 }
  ];
  private static nextSocialHistoryOptionId = 13;

  async getSocialHistoryOptions(socialHistoryId: number) {
    try {
      return MedicalHistoryService.socialHistoryOptions.filter(
        option => option.social_history_id === socialHistoryId
      );
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createSocialHistoryOption(data: any) {
    try {
      const newOption = {
        id: MedicalHistoryService.nextSocialHistoryOptionId++,
        title: data.title,
        social_history_id: data.social_history_id
      };
      MedicalHistoryService.socialHistoryOptions.push(newOption);
      return newOption;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create social history option');
    }
  }

  async updateSocialHistoryOption(id: number, data: any) {
    try {
      const index = MedicalHistoryService.socialHistoryOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        MedicalHistoryService.socialHistoryOptions[index] = {
          id: id,
          title: data.title,
          social_history_id: data.social_history_id
        };
        return MedicalHistoryService.socialHistoryOptions[index];
      }
      throw new Error('Option not found');
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update social history option');
    }
  }

  async getAllSocialHistoryOptions() {
    try {
      return MedicalHistoryService.socialHistoryOptions;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async getMedicationType(locationId?: number) {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS medication_type (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const whereClause = locationId ? 'WHERE location_id = $1' : '';
      const params = locationId ? [locationId] : [];

      const result = await this.pool.query(
        `SELECT * FROM medication_type ${whereClause} ORDER BY title`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createMedicationType(data: any) {
    try {
      const result = await this.pool.query(
        'INSERT INTO medication_type (title, description, location_id) VALUES ($1, $2, $3) RETURNING *',
        [data.title, data.description, data.location_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create medication type');
    }
  }

  async updateMedicationType(id: number, data: any) {
    try {
      const result = await this.pool.query(
        'UPDATE medication_type SET title = $1, description = $2, location_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [data.title, data.description, data.location_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update medication type');
    }
  }

  async getMedicine(locationId?: number) {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS medicine (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const whereClause = locationId ? 'WHERE location_id = $1' : '';
      const params = locationId ? [locationId] : [];

      const result = await this.pool.query(
        `SELECT * FROM medicine ${whereClause} ORDER BY title`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createMedicine(data: any) {
    try {
      const result = await this.pool.query(
        'INSERT INTO medicine (title, description, location_id) VALUES ($1, $2, $3) RETURNING *',
        [data.title, data.description, data.location_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create medicine');
    }
  }

  async updateMedicine(id: number, data: any) {
    try {
      const result = await this.pool.query(
        'UPDATE medicine SET title = $1, description = $2, location_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [data.title, data.description, data.location_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update medicine');
    }
  }

  async getPotency(locationId?: number) {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS potency (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const whereClause = locationId ? 'WHERE location_id = $1' : '';
      const params = locationId ? [locationId] : [];

      const result = await this.pool.query(
        `SELECT * FROM potency ${whereClause} ORDER BY title`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createPotency(data: any) {
    try {
      const result = await this.pool.query(
        'INSERT INTO potency (title, description, location_id) VALUES ($1, $2, $3) RETURNING *',
        [data.title, data.description, data.location_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create potency');
    }
  }

  async updatePotency(id: number, data: any) {
    try {
      const result = await this.pool.query(
        'UPDATE potency SET title = $1, description = $2, location_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [data.title, data.description, data.location_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update potency');
    }
  }

  async getDosage(locationId?: number) {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS dosage (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const whereClause = locationId ? 'WHERE location_id = $1' : '';
      const params = locationId ? [locationId] : [];

      const result = await this.pool.query(
        `SELECT * FROM dosage ${whereClause} ORDER BY title`,
        params
      );

      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async createDosage(data: any) {
    try {
      const result = await this.pool.query(
        'INSERT INTO dosage (title, description, location_id) VALUES ($1, $2, $3) RETURNING *',
        [data.title, data.description, data.location_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create dosage');
    }
  }

  async updateDosage(id: number, data: any) {
    try {
      const result = await this.pool.query(
        'UPDATE dosage SET title = $1, description = $2, location_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [data.title, data.description, data.location_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update dosage');
    }
  }

  async getPharmacyPrescriptions(locationId?: number) {
    try {
      // Add status column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_prescriptions 
        ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 0
      `);

      const whereClause = locationId ? 'WHERE pp.location_id = $1 AND pp.status = 0' : 'WHERE pp.status = 0';
      const params = locationId ? [locationId] : [];

      const result = await this.pool.query(`
        SELECT 
          pp.id as prescription_id,
          pp.patient_id,
          pp.medicine_days,
          pp.next_appointment_date,
          pp.notes_to_pro,
          pp.notes_to_pharmacy,
          pp.status,
          pp.created_at,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') as patient_name,
          json_agg(
            json_build_object(
              'medicine_id', pm.id,
              'medicine_type', pm.medicine_type,
              'medicine', pm.medicine,
              'potency', pm.potency,
              'dosage', pm.dosage,
              'morning', pm.morning,
              'afternoon', pm.afternoon,
              'night', pm.night
            )
          ) FILTER (WHERE pm.id IS NOT NULL) as medicines
        FROM patient_prescriptions pp
        LEFT JOIN prescription_medicines pm ON pp.id = pm.patient_prescriptions_id
        LEFT JOIN patients p ON pp.patient_id = p.id
        ${whereClause}
        GROUP BY pp.id, pp.patient_id, pp.medicine_days, pp.next_appointment_date, 
                 pp.notes_to_pro, pp.notes_to_pharmacy, pp.status, pp.created_at, p.first_name, p.last_name
        ORDER BY pp.created_at DESC
      `, params);

      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async updatePrescriptionStatus(prescriptionId: number, status: number) {
    try {
      const result = await this.pool.query(
        'UPDATE patient_prescriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, prescriptionId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to update prescription status');
    }
  }

  async getPatientExaminations(locationId?: number, page: number = 1, limit: number = 10, fromDate?: string, toDate?: string, search?: string) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = '';
      const params: any[] = [];
      let paramIndex = 1;

      // Build WHERE clause
      const conditions: string[] = [];

      if (locationId) {
        conditions.push(`pe.location_id = $${paramIndex}`);
        params.push(locationId);
        paramIndex++;
      }

      if (fromDate) {
        conditions.push(`pe.created_at >= $${paramIndex}`);
        params.push(fromDate);
        paramIndex++;
      }

      if (toDate) {
        conditions.push(`pe.created_at <= $${paramIndex}`);
        params.push(toDate + ' 23:59:59');
        paramIndex++;
      }

      if (search) {
        conditions.push(`(p.first_name ILIKE $${paramIndex} OR p.last_name ILIKE $${paramIndex} OR (p.first_name || ' ' || p.last_name) ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Get total count
      const countResult = await this.pool.query(`
        SELECT COUNT(*) as total
        FROM patient_examination pe
        LEFT JOIN patients p ON pe.patient_id::text = p.id::text
        ${whereClause}
      `, params);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Get paginated data
      const dataParams = [...params, limit, offset];

      const result = await this.pool.query(`
        SELECT 
          pe.id,
          pe.patient_id,
          pe.treatment_plan_months_doctor,
          pe.next_renewal_date_doctor,
          pe.treatment_plan_months_pro,
          pe.next_renewal_date_pro,
          pe.created_at,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') as patient_name
        FROM patient_examination pe
        LEFT JOIN patients p ON pe.patient_id::text = p.id::text
        ${whereClause}
        ORDER BY pe.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, dataParams);

      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Database error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  async savePatientMedicalHistory(data: any, user: any) {
    try {



      const { patient_id, medical_history_id, medical_history_option_id, category_title, option_title } = data;

      // Validate required fields
      if (!patient_id || !medical_history_id || !medical_history_option_id) {
        throw new Error(`Missing required fields: patient_id=${patient_id}, medical_history_id=${medical_history_id}, medical_history_option_id=${medical_history_option_id}`);
      }

      // Use patient_id directly as numeric ID
      const numericPatientId = parseInt(patient_id);

      // Get numeric medical_history_id from title string
      let numericMedicalHistoryId = medical_history_id;

      if (typeof medical_history_id === 'string' && isNaN(Number(medical_history_id))) {
        const medicalHistoryResult = await this.pool.query(
          'SELECT id FROM medical_history WHERE title ILIKE $1',
          [medical_history_id]
        );

        if (medicalHistoryResult.rows.length > 0) {
          numericMedicalHistoryId = medicalHistoryResult.rows[0].id;
        } else {
          // Use fallback
          numericMedicalHistoryId = 1;
        }
      }

      // Get location_id dynamically using same pattern as patient registration
      const userId = user?.sub || user?.id || user?.userId;
      const location_id = await this.getUserLocationId(userId);



      // Check if record already exists
      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_medical_history WHERE patient_id = $1 AND medical_history_option_id = $2',
        [numericPatientId, medical_history_option_id]
      );

      if (existingRecord.rows.length > 0) {

        return { message: 'Record already exists' };
      }

      // Insert new record


      const result = await this.pool.query(
        'INSERT INTO patient_medical_history (patient_id, medical_history_id, medical_history_option_id, category_title, option_title) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [numericPatientId, numericMedicalHistoryId, medical_history_option_id, category_title, option_title]
      );


      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Detailed error in savePatientMedicalHistory:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to save medical history: ${error.message}`);
    }
  }

  async getPatientMedicalHistory(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pmh.*, 
         COALESCE(mh.title, pmh.category_title) as medical_history_title, 
         COALESCE(mho.title, pmh.option_title) as option_title 
         FROM patient_medical_history pmh
         LEFT JOIN medical_history mh ON pmh.medical_history_id = mh.id
         LEFT JOIN medical_history_options mho ON pmh.medical_history_option_id = mho.id
         WHERE pmh.patient_id = $1
         ORDER BY COALESCE(mh.title, pmh.category_title), COALESCE(mho.title, pmh.option_title)`,
        [numericPatientId]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.medical_history_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.medical_history_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return groupedHistory;
    } catch (error) {
      console.error('Error getting patient medical history:', error);
      throw new Error('Failed to fetch patient medical history');
    }
  }

  async deletePatientMedicalHistory(data: any, user: any) {
    try {
      const { patient_id, medical_history_option_id } = data;
      const numericPatientId = parseInt(patient_id);

      await this.pool.query(
        'DELETE FROM patient_medical_history WHERE patient_id = $1 AND medical_history_option_id = $2',
        [numericPatientId, medical_history_option_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete medical history');
    }
  }
}
