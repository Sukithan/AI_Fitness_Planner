import mongoose, { Document, Schema } from 'mongoose';
import { HealthData } from '@/types';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  healthData: HealthData;
  mealPlans: mongoose.Types.ObjectId[];
  workoutPlans: mongoose.Types.ObjectId[];
  progressLogs: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  healthData: {
    age: Number,
    weight: Number,
    height: Number,
    gender: String,
    goal: { type: String, enum: ['lose weight', 'build muscle', 'maintain','','gain weight'] },
    dietaryRestrictions: [String],
    customAllergies: [String],
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    activityLevel: { 
      type: String, 
      enum: ['sedentary', 'lightly active', 'moderately active', 'very active'] 
    }
  },
  mealPlans: [{ type: Schema.Types.ObjectId, ref: 'MealPlan' }],
  workoutPlans: [{ type: Schema.Types.ObjectId, ref: 'WorkoutPlan' }],
  progressLogs: [{ type: Schema.Types.ObjectId, ref: 'ProgressLog' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);