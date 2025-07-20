'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, Home, Calendar, FileText, Bell, ClipboardList } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/secretaire/dashboard', icon: Home },
  { name: 'Planification', href: '/secretaire/planification', icon: Calendar },
  { name: 'Documents', href: '/secretaire/documents', icon: FileText },
  { name: 'Tâches', href: '/secretaire/taches', icon: ClipboardList },
  { name: 'Notifications', href: '/secretaire/notifications', icon: Bell },
  { name: 'Profile', href: '/secretaire/profile', icon: User }
];

export default function SidebarSecretaire({ user }: { user?: { nom: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <aside className="fixed h-screen bg-gray-900 flex flex-col justify-between shadow-xl border-r border-gray-800 w-72 md:w-60 sm:w-20 transition-all duration-300">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center py-8 sm:py-4">
          <Image
            src="/logo.png"
            alt="Logo ProTrack"
            width={40}
            height={40}
            className="mr-2 sm:mr-0"
            priority
          />
          <span className="text-2xl font-bold text-white">ProTrack</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <ul>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 mx-2 px-4 py-2 rounded-lg font-medium transition-colors
                      ${isActive
                        ? 'bg-red-900 text-white border-l-4 border-red-700'
                        : 'bg-gray-800 text-gray-300 hover:bg-red-900 hover:text-white hover:border-l-4 hover:border-red-700'
                      }
                      sm:justify-center sm:px-2 sm:gap-0
                    `}
                  >
                    {/* Icon */}
                    <Icon
                      className={`h-6 w-6 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {/* Label toujours affiché */}
                    <span className="text-base font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Profil et Déconnexion */}
      <div className="px-6 py-6 border-t border-gray-800 flex items-center justify-between sm:flex-col sm:gap-2 sm:px-2 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-center">
          <User className="h-7 w-7 text-gray-400" />
          <div>
            <div className="text-white font-semibold text-sm">{user?.nom || 'Utilisateur'}</div>
            <div className="text-gray-400 text-xs">{user?.email || 'email inconnu'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Déconnexion"
          className="ml-4 p-2 rounded-full bg-gray-800 hover:bg-red-900 transition-colors sm:ml-0"
        >
          <LogOut className="h-6 w-6 text-gray-400 hover:text-white" />
        </button>
      </div>
    </aside>
  );
}