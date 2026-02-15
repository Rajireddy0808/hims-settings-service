import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserLocationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserLocationId(userId: number): Promise<number> {
    try {
      // Get user's primary location
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // If user has primary location, return it
      if (user.primaryLocationId) {
        return user.primaryLocationId;
      }

      // Check user location permissions for any location
      const locationPermission = await this.userRepository.query(
        'SELECT location_id FROM user_location_permissions WHERE user_id = $1 AND location_id IS NOT NULL LIMIT 1',
        [userId]
      );

      if (locationPermission.length > 0) {
        return locationPermission[0].location_id;
      }

      // Default to location 1 if no location found
      return 1;
    } catch (error) {
      console.error('Error getting user location:', error);
      return 1; // Default fallback
    }
  }

  async getUserDetails(userId: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const locationId = await this.getUserLocationId(userId);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        locationId: locationId,
        primaryLocationId: user.primaryLocationId
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }
}
