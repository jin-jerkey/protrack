'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { Plus, User } from 'lucide-react';

interface Projet {
  id: number;
  nom: string;
}

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
  const [projets, setProjets] = useState<Projet[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [newTache, setNewTache] = useState({
    titre: '',
    description: '',
    responsableIds: [] as number[], // Changer responsableId en responsableIds array
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
        // Récupérer les projets
        const resProjets = await fetch('http://localhost:5000/api/planification/projets', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resProjets.ok) {
          const projetsData = await resProjets.json();
          setProjets(projetsData);
        }

        // Récupérer les tâches
        const resTaches = await fetch('http://localhost:5000/api/planification/taches', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Ajoutez cette ligne
        });
        
        if (resTaches.ok) {
          const data = await resTaches.json();
          setTaches(data);
        }

        // Récupérer tous les utilisateurs sans filtre
        const resUsers = await fetch('http://localhost:5000/api/utilisateur', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUtilisateurs(data); // Enlever le filtre
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/planification/creer-tache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...newTache,
          // Pour chaque responsable, créer une tâche ou une assignation
          responsables: newTache.responsableIds
        })
      });

      if (res.ok) {
        setShowPlanningModal(false);
        setNewTache({
          titre: '',
          description: '',
          responsableIds: [],
          projetId: '',
          dateDebut: '',
          dateFin: '',
          priorite: 'moyenne'
        });
        
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
            <p className="text-gray-600">Créez et assignez des tâches aux membres de l&apos;équipe</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={() => setShowPlanningModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Modal de création de tâche */}
        {showPlanningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">Créer une nouvelle tâche</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projet
                  </label>
                  <select
                    required
                    value={newTache.projetId}
                    onChange={(e) => setNewTache({...newTache, projetId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projets.map(projet => (
                      <option key={projet.id} value={projet.id}>{projet.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la tâche
                  </label>
                  <input
                    type="text"
                    required
                    value={newTache.titre}
                    onChange={(e) => setNewTache({...newTache, titre: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTache.description}
                    onChange={(e) => setNewTache({...newTache, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsables
                  </label>
                  <select
                    multiple
                    required
                    value={newTache.responsableIds.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                      setNewTache({...newTache, responsableIds: selected});
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    {utilisateurs.length > 0 ? (
                      utilisateurs.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.nom} ({user.role})
                        </option>
                      ))
                    ) : (
                      <option disabled>Aucun utilisateur disponible</option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs responsables
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      required
                      value={newTache.dateDebut}
                      onChange={(e) => setNewTache({...newTache, dateDebut: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      required
                      value={newTache.dateFin}
                      onChange={(e) => setNewTache({...newTache, dateFin: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={newTache.priorite}
                    onChange={(e) => setNewTache({...newTache, priorite: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPlanningModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Créer la tâche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des tâches existantes */}
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
      </main>
    </div>
  );
}