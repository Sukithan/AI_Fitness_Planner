// Core User Types
export interface HealthData {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other' | 'prefer not to say';
  goal: 'lose fat' | 'build muscle' | 'maintain' | 'improve endurance';
  dietaryRestrictions: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  activityLevel: 'sedentary' | 'lightly active' | 'moderately active' | 'very active' | 'extremely active';
  allergies?: string[];
  preferences?: {
    cuisine?: string[];
    workoutTypes?: string[];
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  healthData: HealthData;
  mealPlans: MealPlan[];
  workoutPlans: WorkoutPlan[];
  progressLogs: ProgressLog[];
  createdAt: Date;
  updatedAt: Date;
}

// Meal Plan Types
export interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy';
}

export interface Meal {
  time?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  readyInMinutes?: number;
  servings?: number;
}

export interface DayMealPlan {
  day: string; // e.g., "Monday"
  date?: Date; // Specific date
  meals: Meal[];
  totalCalories: number;
  macrosSummary?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlan {
  _id: string;
  userId: string;
  title?: string;
  startDate: Date;
  endDate: Date;
  calorieTarget: number;
  macroTarget: {
    protein: number;
    carbs: number;
    fat: number;
  };
  days: DayMealPlan[];
  shoppingList: {
    category: string;
    items: {
      name: string;
      amount: string;
      purchased?: boolean;
    }[];
  }[];
  notes?: string;
  generatedByAI?: boolean;
  aiFeedback?: string;
}

// Workout Plan Types
export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Could be "8-12", "AMRAP", or "5x5"
  rest: string;
  description: string;
  videoUrl?: string;
  equipment?: string[];
  muscleGroups?: string[];
  intensity?: 'low' | 'medium' | 'high';
  tempo?: string; // e.g., "2-0-1-0"
}

export interface WorkoutSession {
  time?: string;
  exercises: Exercise[];
  duration: string;
  caloriesBurned?: number;
  focusArea: 'upper' | 'lower' | 'full' | 'cardio' | 'core' | 'flexibility';
  completed?: boolean;
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g., "Monday"
  date?: Date; // Specific date
  sessions: WorkoutSession[];
  restDay?: boolean;
  notes?: string;
}

export interface WorkoutPlan {
  _id: string;
  userId: string;
  title?: string;
  startDate: Date;
  endDate: Date;
  days: WorkoutDay[];
  fitnessGoal?: string;
  experienceLevel?: string;
  equipmentAvailable?: string[];
  notes?: string;
  generatedByAI?: boolean;
  aiFeedback?: string;
}

// Progress Tracking Types
export interface ProgressMeasurement {
  date: Date;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[]; // URLs to stored photos
  notes?: string;
}

export interface WorkoutLog {
  date: Date;
  workoutPlanId: string;
  workoutDayId: string;
  exercises: {
    exerciseId: string;
    sets: {
      setNumber: number;
      reps: number;
      weight: number;
      rpe?: number; // Rate of Perceived Exertion
      notes?: string;
    }[];
  }[];
  duration: number;
  notes?: string;
}

export interface NutritionLog {
  date: Date;
  meals: {
    mealId?: string;
    name: string;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
    time: string;
  }[];
  waterIntake?: number; // in liters
  supplements?: {
    name: string;
    dosage: string;
    time: string;
  }[];
  notes?: string;
}

export interface ProgressLog {
  _id: string;
  userId: string;
  date: Date;
  measurements?: ProgressMeasurement;
  workoutLogs?: WorkoutLog[];
  nutritionLogs?: NutritionLog[];
  notes?: string;
}

// AI Integration Types
export interface AIGenerationRequest {
  userId: string;
  healthData: HealthData;
  preferences?: {
    mealPreferences?: {
      cuisine?: string[];
      dislikedIngredients?: string[];
    };
    workoutPreferences?: {
      favoriteExercises?: string[];
      dislikedExercises?: string[];
    };
  };
  generationType: 'meal-plan' | 'workout-plan' | 'both';
}

export interface AIGenerationResponse {
  success: boolean;
  mealPlan?: MealPlan;
  workoutPlan?: WorkoutPlan;
  warnings?: string[];
  nutritionalSummary?: string;
  fitnessRecommendations?: string;
  generatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

// UI Specific Types
export interface DashboardSummary {
  currentWeight?: number;
  goalWeight?: number;
  bmi?: number;
  bmiCategory?: string;
  weeklyProgress?: {
    weightChange?: number;
    strengthProgress?: number;
    enduranceProgress?: number;
  };
  upcomingWorkouts?: WorkoutSession[];
  mealSuggestions?: Meal[];
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}