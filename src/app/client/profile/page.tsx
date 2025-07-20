'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarClient from '@/app/component/siderbarclient';

interface UserProfile {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: string;
  activite?: string;
  pays?: string;
  dateCreation: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);
      setUser(user);

      try {
        const res = await fetch(`http://localhost:5000/api/utilisateur/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else if (res.status === 401) {
          router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <div className="flex">
      <SidebarClient user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-red-700 mb-8">Mon Profil</h1>

          {profile && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
                      <p className="text-gray-800">{profile.nom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-gray-800">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                      <p className="text-gray-800">{profile.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations professionnelles</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Rôle</label>
                      <p className="text-gray-800 capitalize">{profile.role}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Activité</label>
                      <p className="text-gray-800">{profile.activite || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Pays</label>
                      <p className="text-gray-800">{profile.pays || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Membre depuis</label>
                      <p className="text-gray-800">
                        {new Date(profile.dateCreation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}