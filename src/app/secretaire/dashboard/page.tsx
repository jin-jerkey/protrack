'use client';

import { useEffect, useState } from 'react';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { Calendar, ClipboardList, FileText, Bell } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface Notification {
  id: number;
  sujet: string;
  contenu: string;
  date: string;
  lu: boolean;
}

export default function DashboardSecretaire() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [stats, setStats] = useState<Stat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Récupérer infos utilisateur
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    // Récupérer les stats (exemple, à adapter selon vos routes backend)
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/secretaire/dashboard-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats([
            {
              label: 'Tâches à planifier',
              value: data.tachesAPlanifier,
              icon: <ClipboardList className="w-6 h-6" />,
              color: 'border-blue-400'
            },
            {
              label: 'Documents à traiter',
              value: data.documentsATraiter,
              icon: <FileText className="w-6 h-6" />,
              color: 'border-green-400'
            },
            {
              label: 'Événements à venir',
              value: data.evenementsAVenir,
              icon: <Calendar className="w-6 h-6" />,
              color: 'border-yellow-400'
            },
            {
              label: 'Notifications',
              value: data.notificationsNonLues,
              icon: <Bell className="w-6 h-6" />,
              color: 'border-red-400'
            }
          ]);
        }
      } catch {
        // fallback statique si erreur
        setStats([
          { label: 'Tâches à planifier', value: 0, icon: <ClipboardList className="w-6 h-6" />, color: 'border-blue-400' },
          { label: 'Documents à traiter', value: 0, icon: <FileText className="w-6 h-6" />, color: 'border-green-400' },
          { label: 'Événements à venir', value: 0, icon: <Calendar className="w-6 h-6" />, color: 'border-yellow-400' },
          { label: 'Notifications', value: 0, icon: <Bell className="w-6 h-6" />, color: 'border-red-400' }
        ]);
      }
    };

    // Récupérer notifications récentes
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notification/secretaire', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.slice(0, 5));
        }
      } catch {
        setNotifications([]);
      }
    };

    fetchStats();
    fetchNotifications();
  }, []);

  return (
    <div className="flex">
      <SidebarSecretaire user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Tableau de bord secrétaire</h1>
          <p className="text-gray-600">Vue d’ensemble de vos tâches, documents et notifications</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow p-6 border-l-4 ${stat.color}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 mr-4">{stat.icon}</div>
                <div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications récentes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Dernières notifications</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul>
              {notifications.length === 0 ? (
                <li className="p-6 text-gray-500 text-center">Aucune notification récente</li>
              ) : (
                notifications.map(n => (
                  <li key={n.id} className="border-b last:border-b-0 px-6 py-4 flex flex-col">
                    <span className="font-medium text-gray-800">{n.sujet}</span>
                    <span className="text-gray-600 text-sm">{n.contenu}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleString('fr-FR')}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* Accès rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/secretaire/planification" className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-red-50 transition">
            <Calendar className="w-8 h-8 text-red-600 mr-4" />
            <span className="text-lg font-semibold text-red-700">Planifier une tâche</span>
          </a>
          <a href="/secretaire/documents" className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-red-50 transition">
            <FileText className="w-8 h-8 text-red-600 mr-4" />
            <span className="text-lg font-semibold text-red-700">Gérer les documents</span>
          </a>
          <a href="/secretaire/notifications" className="bg-white rounded-lg shadow p-6 flex items-center hover:bg-red-50 transition">
            <Bell className="w-8 h-8 text-red-600 mr-4" />
            <span className="text-lg font-semibold text-red-700">Voir toutes les notifications</span>
          </a>
        </div>
      </main>
    </div>
  );
}