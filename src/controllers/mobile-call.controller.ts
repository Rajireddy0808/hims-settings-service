import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// In-memory storage for call requests
let callRequests = [];
let requestIdCounter = 1;

@Controller()
export class MobileCallController {
  
  @Post('trigger-mobile-call')
  triggerMobileCall(@Body() body: { phone_number: string; patient_name?: string; patient_id?: number; requested_by?: string; user_id?: number }) {
    const { phone_number, patient_name, patient_id, requested_by, user_id } = body;
    
    const callRequest = {
      id: requestIdCounter++,
      phone_number,
      patient_name: patient_name || 'Unknown Patient',
      patient_id,
      requested_by: requested_by || 'System',
      user_id: user_id || null,
      created_at: new Date().toISOString(),
    };
    
    callRequests.push(callRequest);
    console.log('New call request created:', callRequest);
    
    return { success: true, message: 'Mobile call request created', data: callRequest };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mobile-call-requests')
  getMobileCallRequests(@Request() req) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    console.log('Getting call requests for user:', userId);
    console.log('User object:', req.user);
    
    // If no userId from token, return all requests (for now)
    if (!userId) {
      console.log('No user ID found, returning all requests');
      return callRequests;
    }
    
    // Filter by user_id
    const filteredRequests = callRequests.filter(request => request.user_id === userId);
    
    console.log('Filtered call requests:', filteredRequests);
    return filteredRequests;
  }

  @Delete('mobile-call-requests/:id')
  deleteCallRequest(@Param('id') id: string) {
    const requestId = parseInt(id);
    const initialLength = callRequests.length;
    callRequests = callRequests.filter(request => request.id !== requestId);
    const deleted = callRequests.length < initialLength;
    console.log(`Delete request ${requestId}: ${deleted ? 'success' : 'not found'}`);
    return { success: deleted };
  }
}