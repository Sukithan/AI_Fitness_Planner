import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with default health data
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      healthData: {
        age: 0,
        weight: 0,
        height: 0,
        gender: 'other',
        goal: 'maintain',
        fitnessLevel: 'beginner',
        activityLevel: 'moderately active',
        dietaryRestrictions: [],
        allergies: []
      },
      createdAt: new Date()
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json<ApiResponse<typeof userWithoutPassword>>(
      { 
        success: true, 
        data: userWithoutPassword,
        message: 'Registration successful' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}