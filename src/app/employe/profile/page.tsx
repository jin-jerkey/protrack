'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarEmploye from '@/app/component/siderbarEmploye';
import { User, Phone, Mail, Calendar, Save, X } from 'lucide-react';

interface UserProfile {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  date_creation: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    telephone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    // Récupérer les informations détaillées de l'utilisateur
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/employe/profile/${parsedUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setEditForm({
            nom: data.nom,
            telephone: data.telephone || ''
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement du profil');
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/employe/profile/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        setSuccess('Profil mis à jour avec succès');
        setIsEditing(false);
        // Mettre à jour les informations locales
        setUser(prev => prev ? { ...prev, ...editForm } : null);
        // Mettre à jour le localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...userData, nom: editForm.nom }));
      } else {
        setError('Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex">
      <SidebarEmploye user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon Profil</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={40} className="text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-semibold text-gray-800">{user.nom}</h2>
                    <p className="text-gray-600">{user.role}</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Modifier le profil
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editForm.nom}
                      onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={editForm.telephone}
                      onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ nom: user.nom, telephone: user.telephone });
                      }}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <X size={20} className="mr-2" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save size={20} className="mr-2" />
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="text-gray-800">{user.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date d&apos;inscription</p>
                      <p className="text-gray-800">
                        {new Date(user.date_creation).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}