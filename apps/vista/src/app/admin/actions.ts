'use server';

import dbConnect from '@/lib/db';
import MembershipApplication from '@/models/MembershipApplication';
import { verifyAdminCredentials, createSession, setSessionCookie, clearSession, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type LoginResponse = {
  success: boolean;
  error?: string;
};

export type ApplicationsResponse = {
  success: boolean;
  data?: Array<{
    _id: string;
    fullName: string;
    email: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  error?: string;
};

export type UpdateStatusResponse = {
  success: boolean;
  error?: string;
};

export async function loginAdmin(username: string, password: string): Promise<LoginResponse> {
  try {
    const isValid = await verifyAdminCredentials(username, password);
    
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = await createSession(username);
    await setSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function logoutAdmin(): Promise<void> {
  await clearSession();
}

export async function getMembershipApplications(): Promise<ApplicationsResponse> {
  try {
    // Verify session
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    
    const applications = await MembershipApplication.find({})
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: applications.map(app => ({
        _id: app._id.toString(),
        fullName: app.fullName,
        email: app.email,
        reason: app.reason,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return { success: false, error: 'Failed to fetch applications' };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<UpdateStatusResponse> {
  try {
    // Verify session
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    
    await MembershipApplication.findByIdAndUpdate(id, { status });
    
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
