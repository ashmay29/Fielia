'use server';

import dbConnect from '@/lib/db';
import MembershipApplication from '@/models/MembershipApplication';

export type MembershipApplicationData = {
  fullName: string;
  email: string;
  reason: string;
};

export type MembershipApplicationResponse = {
  success: boolean;
  data?: {
    fullName: string;
    email: string;
    reason: string;
    status: string;
  };
  error?: string;
};

export async function createMembershipApplication(
  data: MembershipApplicationData
): Promise<MembershipApplicationResponse> {
  if (!data.fullName || !data.email || !data.reason) {
    return { success: false, error: 'All fields are required' };
  }

  // Basic email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Please provide a valid email address' };
  }

  try {
    await dbConnect();

    // Check if email already exists
    const existing = await MembershipApplication.findOne({ 
      email: data.email.toLowerCase().trim() 
    });
    
    if (existing) {
      return { 
        success: false, 
        error: 'An application with this email already exists' 
      };
    }

    const newApplication = await MembershipApplication.create({
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      reason: data.reason.trim(),
    });

    return {
      success: true,
      data: {
        fullName: newApplication.fullName,
        email: newApplication.email,
        reason: newApplication.reason,
        status: newApplication.status,
      },
    };
  } catch (error) {
    console.error('Error creating membership application:', error);
    
    // Handle duplicate key error (in case unique constraint is violated)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return { 
        success: false, 
        error: 'An application with this email already exists' 
      };
    }
    
    return { success: false, error: 'Failed to submit application. Please try again.' };
  }
}
