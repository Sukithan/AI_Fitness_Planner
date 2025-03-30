'use client';

import { User } from '@/types';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function UserAvatar({ user }: { user: User }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center space-x-2 focus:outline-none group">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden ring-2 ring-white ring-opacity-80 group-hover:ring-opacity-100 transition-all duration-200 shadow-md">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.name}'s avatar`}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <span className="flex items-center justify-center h-full w-full text-white text-lg font-medium">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <span className="hidden md:inline-block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
            {user.name}
          </span>
          <svg
            className="hidden md:block h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors duration-200"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95 -translate-y-2"
        enterTo="transform opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100 translate-y-0"
        leaveTo="transform opacity-0 scale-95 -translate-y-2"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl ring-1 ring-black/10 backdrop-blur-sm focus:outline-none z-50 overflow-hidden">
          {/* User info section with gradient */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          
          {/* Menu items section */}
          <div className="py-1">
            {/* <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/profile"
                  className={`${
                    active ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600' : 'text-gray-700'
                  } block px-4 py-2.5 text-sm transition-all duration-200 flex items-center`}
                >
                  <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/settings"
                  className={`${
                    active ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600' : 'text-gray-700'
                  } block px-4 py-2.5 text-sm transition-all duration-200 flex items-center`}
                >
                  <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </Link>
              )}
            </Menu.Item> */}
          </div>
          
          {/* Sign out section */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`${
                    active ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600' : 'text-gray-700'
                  } block w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center`}
                >
                  <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}