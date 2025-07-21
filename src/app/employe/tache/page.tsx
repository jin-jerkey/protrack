'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarEmploye from '@/app/component/siderbarEmploye';
import {  Search } from 'lucide-react';
import { Eye, Check, CheckCircle } from 'lucide-react';

interface Tache {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateFinReelle?: string;
  statut: 'à_faire' | 'en_cours' | 'terminée' | 'bloquée';
  priorite: 'faible' | 'moyenne' | 'haute' | 'critique';
  projet: string;
  responsable: string;
}

interface Stats {
  total: number;
  aFaire: number;
  enCours: number;
  terminees: number;
  bloquees: number;
}

export default function TachesEmployePage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [taches, setTaches] = useState<Tache[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    aFaire: 0,
    enCours: 0,
    terminees: 0,
    bloquees: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

    const fetchTaches = async () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      try {
        const res = await fetch(`http://localhost:5000/api/employe/taches?userId=${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          setTaches(data);
          setStats({
            total: data.length,
            aFaire: data.filter((t: Tache) => t.statut === 'à_faire').length,
            enCours: data.filter((t: Tache) => t.statut === 'en_cours').length,
            terminees: data.filter((t: Tache) => t.statut === 'terminée').length,
            bloquees: data.filter((t: Tache) => t.statut === 'bloquée').length
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchTaches();
  }, [router]);

  // Filtrer les tâches
  const filteredTaches = taches.filter(tache => {
    const matchSearchTerm = tache.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = statutFilter === 'tous' || tache.statut === statutFilter;
    return matchSearchTerm && matchStatut;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminée': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'à_faire': return 'bg-yellow-100 text-yellow-800';
      case 'bloquée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'bg-red-100 text-red-800';
      case 'haute': return 'bg-orange-100 text-orange-800';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateTacheStatus = async (tacheId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employe/tache/${tacheId}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: newStatus })
      });

      if (res.ok) {
        // Mettre à jour la tâche localement
        setTaches(taches.map(tache => 
          tache.id === tacheId 
            ? { ...tache, statut: newStatus as Tache['statut'] } 
            : tache
        ));
        
        // Mettre à jour les statistiques
        setStats({
          total: taches.length,
          aFaire: newStatus === 'à_faire' ? stats.aFaire + 1 : stats.aFaire - 1,
          enCours: newStatus === 'en_cours' ? stats.enCours + 1 : stats.enCours - 1,
          terminees: newStatus === 'terminée' ? stats.terminees + 1 : stats.terminees,
          bloquees: stats.bloquees
        });
        
        // Fermer le modal si la tâche est terminée
        if (newStatus === 'terminée') {
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="flex">
      <SidebarEmploye user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes tâches</h1>
          <p className="text-gray-600">Gérez et suivez vos tâches assignées</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total tâches</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.aFaire}</div>
            <div className="text-sm text-gray-600">À faire</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.enCours}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.terminees}</div>
            <div className="text-sm text-gray-600">Terminées</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.bloquees}</div>
            <div className="text-sm text-gray-600">Bloquées</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="à_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="terminée">Terminées</option>
            <option value="bloquée">Bloquées</option>
          </select>
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTaches.map(tache => (
            <div key={tache.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg text-gray-900">{tache.titre}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(tache.statut)}`}>
                    {tache.statut}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPrioriteColor(tache.priorite)}`}>
                    {tache.priorite}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{tache.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Projet: {tache.projet}</span>
                  <span>Responsable: {tache.responsable || 'Non assigné'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Début: {new Date(tache.dateDebut).toLocaleDateString('fr-FR')}</span>
                  <span>Échéance: {new Date(tache.dateFin).toLocaleDateString('fr-FR')}</span>
                </div>
                {tache.dateFinReelle && (
                  <div className="text-green-600">
                    Terminée le: {new Date(tache.dateFinReelle).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedTache(tache);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Eye size={20} />
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Détails de la tâche (Modal) */}
        {showModal && selectedTache && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedTache.titre}</h2>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(selectedTache.statut)}`}>
                    {selectedTache.statut}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPrioriteColor(selectedTache.priorite)}`}>
                    {selectedTache.priorite}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTache.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Projet</h3>
                    <p className="text-gray-600">{selectedTache.projet}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Responsable</h3>
                    <p className="text-gray-600">{selectedTache.responsable || 'Non assigné'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Date de début</h3>
                    <p className="text-gray-600">
                      {new Date(selectedTache.dateDebut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Date de fin prévue</h3>
                    <p className="text-gray-600">
                      {new Date(selectedTache.dateFin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {selectedTache.dateFinReelle && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Date de fin réelle</h3>
                    <p className="text-green-600">
                      {new Date(selectedTache.dateFinReelle).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Fermer
                  </button>

                  {selectedTache.statut === 'à_faire' && (
                    <button
                      onClick={() => updateTacheStatus(selectedTache.id, 'en_cours')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Check size={20} />
                      Valider
                    </button>
                  )}

                  {selectedTache.statut === 'en_cours' && (
                    <button
                      onClick={() => updateTacheStatus(selectedTache.id, 'terminée')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle size={20} />
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}