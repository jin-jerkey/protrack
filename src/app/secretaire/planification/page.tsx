'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { Plus, User } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Tache {
  id: number;
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  responsable: string;
  projet: string;
  statut: string;
  priorite: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  role: string;
}

export default function PlanificationPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [taches, setTaches] = useState<Tache[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [newTache, setNewTache] = useState({
    titre: '',
    description: '',
    responsableId: '',
    projetId: '',
    dateDebut: '',
    dateFin: '',
    priorite: 'moyenne'
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/');
        return;
      }
      setUser(JSON.parse(userData));

      try {
        // Récupérer les tâches
        const resTaches = await fetch('http://localhost:5000/api/planification/taches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resTaches.ok) {
          const data = await resTaches.json();
          setTaches(data);
        }

        // Récupérer les utilisateurs
        const resUsers = await fetch('http://localhost:5000/api/utilisateur/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUtilisateurs(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, [router]);

  const tachesDuJour = taches.filter(tache => {
    const dateDebut = new Date(tache.dateDebut as string);
    return (
      dateDebut.getDate() === selectedDate.getDate() &&
      dateDebut.getMonth() === selectedDate.getMonth() &&
      dateDebut.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleAssignTache = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/planification/assigner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(newTache)
      });

      if (res.ok) {
        setShowPlanningModal(false);
        // Rafraîchir les tâches
        const resTaches = await fetch('http://localhost:5000/api/planification/taches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resTaches.ok) {
          const data = await resTaches.json();
          setTaches(data);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="flex">
      <SidebarSecretaire user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-700 mb-2">Planification des tâches</h1>
            <p className="text-gray-600">Gérez et planifiez les tâches des projets</p>
          </div>
          <button
            onClick={() => setShowPlanningModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Planifier une tâche
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  setSelectedDate(value[0]);
                }
              }}
              value={selectedDate}
              className="w-full border-0"
              tileClassName={({ date }) => {
                const hasTache = taches.some(tache => {
                  const dateDebut = new Date(tache.dateDebut as string);
                  return (
                    dateDebut.getDate() === date.getDate() &&
                    dateDebut.getMonth() === date.getMonth() &&
                    dateDebut.getFullYear() === date.getFullYear()
                  );
                });
                return hasTache ? 'bg-red-100 text-red-800' : '';
              }}
            />
          </div>

          {/* Liste des tâches du jour */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tâches du {selectedDate.toLocaleDateString('fr-FR', { dateStyle: 'long' })}
            </h2>
            <div className="space-y-4">
              {tachesDuJour.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune tâche planifiée pour ce jour</p>
              ) : (
                tachesDuJour.map(tache => (
                  <div
                    key={tache.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{tache.titre}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          tache.priorite === 'haute'
                            ? 'bg-red-100 text-red-800'
                            : tache.priorite === 'moyenne'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {tache.priorite}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tache.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {tache.responsable || 'Non assigné'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de planification */}
        {showPlanningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Planifier une nouvelle tâche</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAssignTache();
              }}>
                {/* Formulaire de planification */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la tâche
                  </label>
                  <input
                    type="text"
                    value={newTache.titre}
                    onChange={(e) => setNewTache({ ...newTache, titre: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTache.description}
                    onChange={(e) => setNewTache({ ...newTache, description: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <select
                    value={newTache.responsableId}
                    onChange={(e) => setNewTache({ ...newTache, responsableId: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  >
                    <option value="">Sélectionner un responsable</option>
                    {utilisateurs.map(utilisateur => (
                      <option key={utilisateur.id} value={utilisateur.id}>
                        {utilisateur.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projet
                  </label>
                  <input
                    type="text"
                    value={newTache.projetId}
                    onChange={(e) => setNewTache({ ...newTache, projetId: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={newTache.dateDebut}
                      onChange={(e) => setNewTache({ ...newTache, dateDebut: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={newTache.dateFin}
                      onChange={(e) => setNewTache({ ...newTache, dateFin: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newTache.priorite}
                    onChange={(e) => setNewTache({ ...newTache, priorite: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter la tâche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}