'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/component/siderbar';
import { Bell, Check, Search } from 'lucide-react';

interface Notification {
  id: number;
  type: 'email' | 'portal';
  sujet: string;
  contenu: string;
  lu: boolean;
  date: string;
  destinataire: string;
  projet?: string;
}

export default function NotificationsAdminPage() {
  const [user, setUser] = useState<{ id: number; nom: string; email: string }>({ 
    id: 0, nom: '', email: '' 
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    nonLues: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notification/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setStats({
          total: data.length,
          nonLues: data.filter((n: Notification) => !n.lu).length
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      
      if (res.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, lu: true } : notif
        ));
        setStats(prev => ({
          ...prev,
          nonLues: prev.nonLues - 1
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notif.projet && notif.projet.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-gray-600">Gérez toutes les notifications du système</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total des notifications</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.nonLues}</div>
              <div className="text-sm text-gray-600">Notifications non lues</div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="space-y-4">
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id}
                className={`bg-white rounded-lg shadow p-4 transition-all ${
                  !notif.lu ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Bell className={`w-5 h-5 ${!notif.lu ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{notif.sujet}</h3>
                      <p className="text-gray-600 mt-1">{notif.contenu}</p>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <span>{new Date(notif.date).toLocaleString('fr-FR')}</span>
                        <span>•</span>
                        <span>Pour: {notif.destinataire}</span>
                        {notif.projet && (
                          <>
                            <span>•</span>
                            <span>Projet: {notif.projet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!notif.lu && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Check className="w-4 h-4" />
                      <span>Marquer comme lu</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}