'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, MealPlan, WorkoutPlan } from '@/types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateDailyPlan } from '@/lib/ai';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [customAllergy, setCustomAllergy] = useState('');
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [aiPlan, setAiPlan] = useState<{
    mealPlan: MealPlan | null;
    workoutPlan: WorkoutPlan | null;
    loading: boolean;
    error: string | null;
  }>({ mealPlan: null, workoutPlan: null, loading: false, error: null });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') { 
      redirect('/auth/login');
    }
  }, [status]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}`);
          const data = await res.json();
          if (res.ok) {
            setUserData(data.data);
            setEditData({
              ...(data.data.healthData || {}),
              customAllergies: data.data.healthData?.customAllergies || []
            });
          } else {
            throw new Error(data.error || 'Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          showToast('Failed to load user data', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [session, status]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({show: true, message, type});
    setTimeout(() => setToast({...toast, show: false}), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const newRestrictions = editData.dietaryRestrictions || [];
    
    if (checked) {
      if (!newRestrictions.includes(name)) {
        setEditData({
          ...editData,
          dietaryRestrictions: [...newRestrictions, name]
        });
      }
    } else {
      setEditData({
        ...editData,
        dietaryRestrictions: newRestrictions.filter(r => r !== name)
      });
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim()) {
      const updatedAllergies = [...(editData.customAllergies || []), customAllergy.trim()];
      setEditData({
        ...editData,
        customAllergies: updatedAllergies
      });
      setCustomAllergy('');
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    const updatedAllergies = editData.customAllergies?.filter((a: string) => a !== allergy) || [];
    setEditData({
      ...editData,
      customAllergies: updatedAllergies
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          healthData: {
            ...editData,
            customAllergies: editData.customAllergies || []
          } 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserData((prev) => prev ? { ...prev, healthData: data.data.healthData } : null);
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const generateAiPlan = async () => {
    if (!userData?.healthData) return;

    try {
      setAiPlan(prev => ({ ...prev, loading: true, error: null }));
      const { mealPlan, workoutPlan } = await generateDailyPlan(userData.healthData);
      setAiPlan({ mealPlan, workoutPlan, loading: false, error: null });
      showToast('Daily plan generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating AI plan:', error);
      setAiPlan(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to generate plan. Please try again.' 
      }));
      showToast('Failed to generate daily plan', 'error');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-red-500">Failed to load user data</p>
      </div>
    );
  }

  const healthData = userData.healthData || {};
  const bmi = healthData.weight && healthData.height 
    ? (healthData.weight / ((healthData.height / 100) ** 2)).toFixed(1) 
    : null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-md z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <DashboardHeader user={userData} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Details Section - Mint Green */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 shadow-lg rounded-xl p-6 mb-8 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-teal-800 flex items-center">
              <span className="mr-2">👤</span> Your Personal Details
            </h1>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      ...healthData,
                      customAllergies: healthData.customAllergies || []
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    name="age"
                    type="number"
                    value={editData.age || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-lg text-teal-900">{healthData.age || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Weight (kg)</label>
                {isEditing ? (
                  <input
                    name="weight"
                    type="number"
                    value={editData.weight || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-lg text-teal-900">{healthData.weight || 'Not set'} kg</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Height (cm)</label>
                {isEditing ? (
                  <input
                    name="height"
                    type="number"
                    value={editData.height || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-lg text-teal-900">{healthData.height || 'Not set'} cm</p>
                )}
              </div>
            </div>
            
            {/* Health Metrics */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editData.gender || ''}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-lg text-teal-900">{healthData.gender || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Fitness Goal</label>
                {isEditing ? (
                  <select
                    name="goal"
                    value={editData.goal || ''}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select goal</option>
                    <option value="lose weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain weight">Gain Weight</option>
                    <option value="build muscle">Build Muscle</option>
                  </select>
                ) : (
                  <p className="text-lg text-teal-900">
                    {healthData.goal ? 
                      healthData.goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
                      'Not set'}
                  </p>
                )}
              </div>
              
              {bmi && (
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">BMI</label>
                  <p className="text-lg text-teal-900">
                    {bmi} - 
                    {parseFloat(bmi) < 18.5 ? ' Underweight' :
                     parseFloat(bmi) < 25 ? ' Normal weight' :
                     parseFloat(bmi) < 30 ? ' Overweight' : ' Obese'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-teal-800 mb-4 flex items-center">
              <span className="mr-2">⚠️</span> Dietary Restrictions
            </h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vegetarian"
                      name="vegetarian"
                      checked={editData.dietaryRestrictions?.includes('vegetarian') || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                    />
                    <label htmlFor="vegetarian" className="ml-2 text-teal-700">Vegetarian</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vegan"
                      name="vegan"
                      checked={editData.dietaryRestrictions?.includes('vegan') || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                    />
                    <label htmlFor="vegan" className="ml-2 text-teal-700">Vegan</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gluten-free"
                      name="gluten-free"
                      checked={editData.dietaryRestrictions?.includes('gluten-free') || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                    />
                    <label htmlFor="gluten-free" className="ml-2 text-teal-700">Gluten Free</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dairy-free"
                      name="dairy-free"
                      checked={editData.dietaryRestrictions?.includes('dairy-free') || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
                    />
                    <label htmlFor="dairy-free" className="ml-2 text-teal-700">Dairy Free</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Custom Allergies/Food Restrictions
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                      placeholder="E.g., peanuts, shellfish"
                      className="flex-1 px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomAllergy}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                    >
                      Add
                    </button>
                  </div>
                  {editData.customAllergies?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editData.customAllergies.map((allergy: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm">
                          <span className="mr-1">🚫</span> {allergy}
                          <button
                            onClick={() => removeCustomAllergy(allergy)}
                            className="ml-2 text-teal-500 hover:text-teal-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {(healthData.dietaryRestrictions?.length > 0 || healthData.customAllergies?.length > 0) ? (
                  <div className="flex flex-wrap gap-2">
                    {healthData.dietaryRestrictions?.map((restriction: string, index: number) => (
                      <span key={`r-${index}`} className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm">
                        <span className="mr-1">🚫</span> {restriction}
                      </span>
                    ))}
                    {healthData.customAllergies?.map((allergy: string, index: number) => (
                      <span key={`a-${index}`} className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm">
                        <span className="mr-1">⚠️</span> {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-teal-900">No restrictions specified</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Suggested Plan */}
        <div className="space-y-8">
          {/* Today's Meal Plan - Peach */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg rounded-xl overflow-hidden border border-orange-100">
            <div className="px-6 py-4 border-b border-orange-200 flex justify-between items-center bg-orange-50">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-orange-800">
                  <span className="mr-2">🍽️</span> Today's Meal Plan ({today})
                </h2>
              </div>
              <div className="flex gap-2">
                {!aiPlan.mealPlan && (
                  <button 
                    onClick={generateAiPlan}
                    disabled={aiPlan.loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md disabled:bg-orange-400"
                  >
                    {aiPlan.loading ? 'Generating...' : 'Generate Plan'}
                  </button>
                )}
                {aiPlan.mealPlan && (
                  <button 
                    onClick={generateAiPlan}
                    disabled={aiPlan.loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md disabled:bg-orange-400"
                  >
                    {aiPlan.loading ? 'Regenerating...' : 'Regenerate Plan'}
                  </button>
                )}
              </div>
            </div>
            
            {aiPlan.error && (
              <div className="px-6 py-4 text-red-500">{aiPlan.error}</div>
            )}

            {aiPlan.loading && (
              <div className="px-6 py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            )}

            {!aiPlan.loading && !aiPlan.mealPlan && !aiPlan.error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Profile Incomplete</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Please set your <span className="font-semibold">Age , Height , Weight</span> in your profile</li>
                      <li>Complete all personal details for accurate recommendations</li>
                    </ul>
                    <p className="mt-2 font-medium">Update your profile to generate a personalized plan</p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {aiPlan.mealPlan && aiPlan.mealPlan.days.length > 0 && (
              <div className="px-6 py-4">
                {/* Allergies Warning */}
                {aiPlan.mealPlan.allergiesWarning?.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Allergy Alerts</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {aiPlan.mealPlan.allergiesWarning.map((warning, i) => (
                              <li key={i}>⚠️ {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {aiPlan.mealPlan.days[0].meals.map((meal, index) => (
                    <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-100 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-orange-900">
                            <span className="mr-2">
                              {meal.mealType === 'breakfast' ? '☀️' : 
                               meal.mealType === 'lunch' ? '🌞' : 
                               meal.mealType === 'dinner' ? '🌙' : '🍎'}
                            </span>
                            {meal.time} - {meal.name}
                          </h4>
                          <p className="text-orange-700 mt-1">{meal.description}</p>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-orange-800 border border-orange-200 shadow-sm">
                          {meal.calories} cal
                        </div>
                      </div>
                      {meal.macros && (
                        <div className="mt-3 flex gap-4">
                          <div className="text-sm bg-orange-100 px-2 py-1 rounded-lg">
                            <span className="text-orange-600 font-medium">Protein:</span> {meal.macros.protein}g
                          </div>
                          <div className="text-sm bg-orange-100 px-2 py-1 rounded-lg">
                            <span className="text-orange-600 font-medium">Carbs:</span> {meal.macros.carbs}g
                          </div>
                          <div className="text-sm bg-orange-100 px-2 py-1 rounded-lg">
                            <span className="text-orange-600 font-medium">Fat:</span> {meal.macros.fat}g
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Today's Workout Plan - Lavender */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-4 border-b border-indigo-200 flex justify-between items-center bg-indigo-50">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-indigo-800">
                  <span className="mr-2">💪</span> Today's Fitness Plan ({today})
                </h2>
              </div>
            </div>
            
            {!aiPlan.loading && !aiPlan.workoutPlan && !aiPlan.error && (
              <div className="px-6 py-8 text-center text-indigo-700">
                <p>No workout plan generated yet. Generate a meal plan first.</p>
              </div>
            )}

            {aiPlan.workoutPlan && aiPlan.workoutPlan.days.length > 0 && (
              <div className="px-6 py-4">
                <div className="space-y-6">
                  {aiPlan.workoutPlan.days[0].exercises.map((exercise, index) => (
                    <div key={index} className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-indigo-900">
                            <span className="mr-2">
                              {exercise.focusArea?.includes('cardio') ? '🏃‍♂️' : 
                               exercise.focusArea?.includes('strength') ? '🏋️‍♂️' : '🧘‍♀️'}
                            </span>
                            {exercise.time} - {exercise.name}
                          </h4>
                          <p className="text-indigo-700 mt-1">{exercise.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-indigo-800 border border-indigo-200 shadow-sm">
                            {exercise.duration}
                          </span>
                          <span className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {exercise.intensity} intensity
                          </span>
                        </div>
                      </div>
                      {exercise.focusArea && (
                        <div className="mt-3">
                          <span className="text-sm text-indigo-600 font-medium">Focus:</span> {exercise.focusArea}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shopping List - Sky Blue */}
          {aiPlan.mealPlan?.shoppingList?.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg rounded-xl overflow-hidden border border-blue-100">
              <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                  <span className="mr-2">🛒</span> Today's Shopping List
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {aiPlan.mealPlan.shoppingList.map((item, index) => (
                      <li key={index} className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                        <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-blue-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}