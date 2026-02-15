import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserInfo } from '../entities/user-info.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
  ) {}

  async getProfile(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['userInfo']
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userInfo: user.userInfo
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw new InternalServerErrorException('Failed to get profile');
    }
  }

  async updateProfile(userId: number, updateData: any) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update user basic info
      const userUpdateData: any = {};
      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      if (updateData.email !== undefined) userUpdateData.email = updateData.email;
      if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;

      if (Object.keys(userUpdateData).length > 0) {
        await this.userRepository.update(userId, userUpdateData);
      }

      // Update or create user_info
      if (user.userInfoId) {
        const userInfoUpdateData: any = {};
        if (updateData.alternatePhone !== undefined) userInfoUpdateData.alternatePhone = updateData.alternatePhone;
        if (updateData.address !== undefined) userInfoUpdateData.address = updateData.address;
        if (updateData.pincode !== undefined) userInfoUpdateData.pincode = updateData.pincode;
        if (updateData.qualification !== undefined) userInfoUpdateData.qualification = updateData.qualification;
        if (updateData.yearsOfExperience !== undefined) userInfoUpdateData.yearsOfExperience = updateData.yearsOfExperience;
        if (updateData.medicalRegistrationNumber !== undefined) userInfoUpdateData.medicalRegistrationNumber = updateData.medicalRegistrationNumber;
        if (updateData.registrationCouncil !== undefined) userInfoUpdateData.registrationCouncil = updateData.registrationCouncil;

        if (Object.keys(userInfoUpdateData).length > 0) {
          await this.userInfoRepository.update(user.userInfoId, userInfoUpdateData);
        }
      } else {
        const userInfo = this.userInfoRepository.create({
          userId: userId,
          alternatePhone: updateData.alternatePhone,
          address: updateData.address,
          pincode: updateData.pincode,
          qualification: updateData.qualification,
          yearsOfExperience: updateData.yearsOfExperience,
          medicalRegistrationNumber: updateData.medicalRegistrationNumber,
          registrationCouncil: updateData.registrationCouncil,
        });
        
        await this.userInfoRepository.save(userInfo);
        await this.userRepository.update(userId, { userInfoId: userId });
      }

      return { message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.update(userId, { password: hashedNewPassword });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Change password error:', error);
      throw new InternalServerErrorException('Failed to change password');
    }
  }
}
