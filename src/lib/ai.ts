import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealthData, MealPlan, WorkoutPlan } from '@/types';

// Initialize Google Generative AI with proper error handling
let genAI: GoogleGenerativeAI;

try {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google API key is missing');
  }

  genAI = new GoogleGenerativeAI(apiKey);
} catch (error) {
  console.error('Failed to initialize Google AI:', error);
  throw new Error('Google AI initialization failed');
}

interface AIGeneratedPlan {
  mealPlan: {
    day: string;
    meals: Array<{
      time: string;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      name: string;
      description: string;
      calories: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
  };
  workoutPlan: {
    day: string;
    exercises: Array<{
      time: string;
      name: string;
      duration: string;
      intensity: 'light' | 'moderate' | 'high';
      description: string;
      focusArea?: string;
    }>;
  };
  allergiesWarning?: string[];
  nutritionalSummary?: string | {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  shoppingList?: string[];
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/^```json|```$/g, '').trim();
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  return cleaned;
}

function validateUserData(userData: HealthData): { valid: boolean; missingFields: string[] } {
  const requiredFields = ['age', 'weight', 'height'];
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = userData[field as keyof HealthData];
    if (value === undefined || 
        value === null || 
        (typeof value === 'number' && (isNaN(value) || value === 0))) {
      missingFields.push(field);
    }
  });

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

function generateMissingFieldsPrompt(missingFields: string[]): string {
  const fieldDescriptions = missingFields.map(field => {
    switch(field) {
      case 'age': return 'your age';
      case 'weight': return 'your current weight';
      case 'height': return 'your height';
      default: return field;
    }
  }).join(', ');

  return `Please complete your profile by providing ${fieldDescriptions} before we can generate your personalized plan. 
  These details are essential for creating an accurate fitness and nutrition plan tailored to your needs.`;
}

export async function generateDailyPlan(userData: HealthData): Promise<{
  mealPlan: MealPlan | null;
  workoutPlan: WorkoutPlan | null;
  userMessage?: string;
}> {
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data provided');
  }

  // Validate required fields
  const validation = validateUserData(userData);
  if (!validation.valid) {
    return {
      mealPlan: null,
      workoutPlan: null,
      userMessage: generateMissingFieldsPrompt(validation.missingFields)
    };
  }

  const {
    age,
    gender = 'unspecified',
    weight,
    height,
    goal = 'maintain',
    dietaryRestrictions = [],
    fitnessLevel = 'beginner',
    activityLevel = 'moderate',
    customAllergies = []
  } = userData;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Generate prompt with conditional reminders for incomplete data
  let prompt = `
  Create a detailed, personalized daily fitness plan for TODAY (${today}) with these specifications:
  
  User Profile:
  - Age: ${age}
  - Gender: ${gender}
  - Weight: ${weight} kg
  - Height: ${height} cm
  - Fitness Goal: ${goal}
  - Dietary Restrictions: ${[...dietaryRestrictions, ...customAllergies].join(', ') || 'none'}
  - Fitness Level: ${fitnessLevel}
  - Activity Level: ${activityLevel}

  Requirements:
  1. Today's Meal Plan:
     - 3 main meals + 2 snacks
     - Exact serving sizes and preparation instructions
     - Calorie count for each meal
     - Macronutrient breakdown (protein, carbs, fat)
     - Strictly avoid any dietary restrictions and allergies
  
  2. Today's Workout Plan:
     - Varied exercises matching fitness level
     - Include both cardio and strength training if appropriate
     - Specify duration and intensity
     - Include proper warm-up and cool-down
  
  3. Additional Information:
     - Highlight potential allergy concerns
     - Provide daily nutritional summary (as an object with calories, protein, carbs, fat)
     - Include shopping list for today's meals

  IMPORTANT: 
  - Respond with ONLY a properly formatted JSON object
  - Do NOT include any comments or markdown formatting
  - The JSON should be parseable by JavaScript's JSON.parse()
  - Format meal times consistently (e.g., "7:00 AM" not "7am")
  - Focus only on today's plan (${today})

  Example structure:
  {
    "mealPlan": {
      "day": "${today}",
      "meals": [
        {
          "time": "7:00 AM",
          "mealType": "breakfast",
          "name": "Meal Name",
          "description": "Detailed description with ingredients",
          "calories": 350,
          "macros": {
            "protein": 20,
            "carbs": 40,
            "fat": 10
          }
        }
      ]
    },
    "workoutPlan": {
      "day": "${today}",
      "exercises": [
        {
          "time": "6:30 AM",
          "name": "Exercise Name",
          "duration": "30 minutes",
          "intensity": "moderate",
          "description": "Detailed instructions",
          "focusArea": "cardio"
        }
      ]
    },
    "allergiesWarning": ["Contains nuts"],
    "nutritionalSummary": {
      "calories": 2000,
      "protein": 100,
      "carbs": 250,
      "fat": 70
    },
    "shoppingList": ["Item 1", "Item 2"]
  }`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
        responseMimeType: "application/json"
      }
    });

    const result = await withRetry(async () => {
      return await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
    });

    const response = await result.response;
    const text = response.text();
    const cleanText = cleanJsonResponse(text);

    let aiResponse: AIGeneratedPlan;
    try {
      aiResponse = JSON.parse(cleanText);
      
      if (!aiResponse.mealPlan || !aiResponse.mealPlan.meals || aiResponse.mealPlan.meals.length < 3) {
        throw new Error('Invalid meal plan structure from AI - must include at least 3 meals');
      }
      if (!aiResponse.workoutPlan || !aiResponse.workoutPlan.exercises) {
        throw new Error('Invalid workout plan structure from AI');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', {
        error: parseError,
        originalText: text,
        cleanedText: cleanText
      });
      throw new Error('Invalid response format from AI');
    }

    const mealPlan: MealPlan = {
      _id: '',
      userId: '',
      date: new Date(),
      days: [aiResponse.mealPlan],
      allergiesWarning: aiResponse.allergiesWarning || [],
      nutritionalSummary: typeof aiResponse.nutritionalSummary === 'string' 
        ? aiResponse.nutritionalSummary 
        : JSON.stringify(aiResponse.nutritionalSummary),
      shoppingList: aiResponse.shoppingList || []
    };

    const focusAreas = Array.from(
      new Set(
        aiResponse.workoutPlan.exercises
          .map(ex => ex.focusArea)
          .filter(Boolean)
      )
    ) as string[];

    const workoutPlan: WorkoutPlan = {
      _id: '',
      userId: '',
      date: new Date(),
      days: [aiResponse.workoutPlan],
      focusAreas
    };

    return { 
      mealPlan, 
      workoutPlan
    };
  } catch (error) {
    console.error('Error generating fitness plan:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userData: {
        age,
        gender,
        weight,
        height,
        goal,
        dietaryRestrictions,
        fitnessLevel,
        activityLevel
      }
    });
    throw new Error('Failed to generate fitness plan. Please try again later.');
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    const delay = 1000 * (4 - retries);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1);
  }
}