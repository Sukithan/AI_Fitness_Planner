import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/types';

// Common headers for responses
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params are properly resolved
    const { id } = params;
    await dbConnect();
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User not found', data: null, timestamp: new Date() },
        { status: 404, headers }
      );
    }

    return NextResponse.json<ApiResponse<typeof user>>(
      { success: true, data: user, timestamp: new Date() },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error fetching user:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: params.id,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Server error', data: null, timestamp: new Date() },
      { status: 500, headers }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params are properly resolved
    const { id } = params;
    await dbConnect();
    
    // Validate request has body
    const body = await request.json();
    if (!body || !body.healthData) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing healthData in request body', data: null, timestamp: new Date() },
        { status: 400, headers }
      );
    }

    // Basic validation of healthData
    const { healthData } = body;
    if (typeof healthData !== 'object' || healthData === null) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid healthData format', data: null, timestamp: new Date() },
        { status: 400, headers }
      );
    }

    // Update only the healthData field
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { healthData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User not found', data: null, timestamp: new Date() },
        { status: 404, headers }
      );
    }

    return NextResponse.json<ApiResponse<typeof updatedUser>>(
      { success: true, data: updatedUser, timestamp: new Date() },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error updating user:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: params.id,
      timestamp: new Date().toISOString()
    });

    const errorMessage = error instanceof Error && error.message.includes('validation')
      ? 'Validation failed: ' + error.message
      : 'Server error';

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: errorMessage, data: null, timestamp: new Date() },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}