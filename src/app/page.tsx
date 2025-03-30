import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Sleek Navigation */}
      {/* <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-semibold text-blue-600 tracking-tight">
              AI<span className="font-light"> Fitness Planner</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content - Two Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column - Content */}
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Smarter
              </span>{' '}
              Fitness, <br />Tailored to You
            </h1>
            
            <div className="prose prose-lg text-gray-700 mb-8">
              <p className="mb-4">
                Our AI analyzes your body metrics, dietary restrictions, and fitness goals to create 
                a <span className="font-medium text-blue-600">perfectly balanced plan</span> that evolves with you.
              </p>
              <p className="mb-6">
                Whether you're gluten-free, vegetarian, or have specific nutritional needs, we craft 
                delicious meal plans and effective workouts that fit your lifestyle.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="ml-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Personalized:</span> Plans adapt as your body changes
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="ml-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Science-backed:</span> Based on latest nutrition research
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/auth/register"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-center"
              >
                Started Free
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-all text-center"
              >
                Existing Member? Sign In
              </Link>
            </div>
          </div>

          {/* Right Column - App Preview */}
          <div className="md:w-1/2">
            <div className="relative bg-white p-1 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto md:mx-0 md:ml-auto">
              <div className="absolute -inset-1 rounded-xl bg-blue-50 blur-sm opacity-30"></div>
              <div className="relative bg-white rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b flex items-center">
                  <div className="flex space-x-1.5 mr-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Today's Plan • March 30</div>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                        <h4 className="text-sm font-semibold text-blue-700">Morning Routine</h4>
                      </div>
                      <p className="text-xs text-gray-600 pl-4">7:30 AM • 25 min yoga flow + core</p>
                    </div>
                    <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                      <div className="flex items-center mb-1">
                        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                        <h4 className="text-sm font-semibold text-green-700">Breakfast</h4>
                      </div>
                      <p className="text-xs text-gray-600 pl-4">Greek yogurt with gluten-free granola & berries</p>
                    </div>
                    <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center mb-1">
                        <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                        <h4 className="text-sm font-semibold text-purple-700">Lunch</h4>
                      </div>
                      <p className="text-xs text-gray-600 pl-4">Quinoa salad with chickpeas, avocado & tahini dressing</p>
                    </div>
                    <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                      <div className="flex items-center mb-1">
                        <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>
                        <h4 className="text-sm font-semibold text-yellow-700">Afternoon Workout</h4>
                      </div>
                      <p className="text-xs text-gray-600 pl-4">3:30 PM • Strength training (3 sets x 12 reps)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-20 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} AIFitness • Personalized health optimization</p>
          </div>
        </div>
      </footer>
    </div>
  );
}