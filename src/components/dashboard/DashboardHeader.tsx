import { User } from '@/types';
import UserAvatar from './UserAvatar';

export default function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="bg-purple-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-800">AI Fitness Planner</h1>
        </div>
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} />
        </div>
      </div>
    </header>
  );
}