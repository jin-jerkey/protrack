'use client';

import { useEffect, useState } from 'react';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { Plus, User } from 'lucide-react';

// Données statiques pour les projets
const PROJETS_DEMO = [
  { id: 1, nom: "Projet Site Web E-commerce" },
  { id: 2, nom: "Application Mobile" },
  { id: 3, nom: "Refonte Interface" }
];

// Données statiques pour les utilisateurs
const UTILISATEURS_DEMO = [
  { id: 1, nom: "Jean Dupont", role: "Développeur" },
  { id: 2, nom: "Marie Martin", role: "Designer" },
  { id: 3, nom: "Pierre Durant", role: "Chef de projet" }
];

// Données statiques pour les tâches
const TACHES_DEMO = [
  {
    id: 1,
    titre: "Maquette page d'accueil",
    description: "Créer la maquette pour la nouvelle page d'accueil",
    dateDebut: "2025-07-23",
    dateFin: "2025-07-25",
    responsable: "Marie Martin",
    projet: "Refonte Interface",
    statut: "en_cours",
    priorite: "haute"
  },
  {
    id: 2,
    titre: "Développement API",
    description: "Mettre en place l'API REST pour le projet",
    dateDebut: "2025-07-23",
    dateFin: "2025-07-26",
    responsable: "Jean Dupont",
    projet: "Application Mobile",
    statut: "en_cours",
    priorite: "moyenne"
  },
  {
    id: 3,
    titre: "Tests fonctionnels",
    description: "Réaliser les tests fonctionnels du module panier",
    dateDebut: "2025-07-23",
    dateFin: "2025-07-24",
    responsable: "Pierre Durant",
    projet: "Projet Site Web E-commerce",
    statut: "a_faire",
    priorite: "basse"
  }
];

export default function PlanificationPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [projets,  ] = useState(PROJETS_DEMO);
  const [taches, setTaches] = useState(TACHES_DEMO);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [utilisateurs,  ] = useState(UTILISATEURS_DEMO);
  const [newTache, setNewTache] = useState({
    titre: '',
    description: '',
    responsableIds: [] as number[],
    projetId: '',
    dateDebut: '',
    dateFin: '',
    priorite: 'moyenne'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const tachesDuJour = taches.filter(tache => {
    const dateDebut = new Date(tache.dateDebut);
    return (
      dateDebut.getDate() === selectedDate.getDate() &&
      dateDebut.getMonth() === selectedDate.getMonth() &&
      dateDebut.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Créer une nouvelle tâche avec un ID unique
    const nouvelleTache = {
      id: taches.length + 1,
      titre: newTache.titre,
      description: newTache.description,
      dateDebut: newTache.dateDebut,
      dateFin: newTache.dateFin,
      responsable: utilisateurs.find(u => u.id === newTache.responsableIds[0])?.nom || 'Non assigné',
      projet: projets.find(p => p.id === Number(newTache.projetId))?.nom || '',
      statut: 'a_faire',
      priorite: newTache.priorite
    };

    setTaches([...taches, nouvelleTache]);
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