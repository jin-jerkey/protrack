'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/component/siderbar';
import { Search, AlertTriangle, RotateCcw, CheckCircle, Play } from 'lucide-react';

interface Tache {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateFinReelle?: string;
  statut: 'à_faire' | 'en_cours' | 'terminée' | 'bloquée';
  priorite: string;
  projet: string;
  responsable: string;
}

export default function TachesAdminPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [taches, setTaches] = useState<Tache[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

    const fetchTaches = async () => {
      try {
        // Utiliser la nouvelle route pour toutes les tâches
        const res = await fetch('http://localhost:5000/api/employe/taches/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          setTaches(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchTaches();
  }, [router]);

  const updateTacheStatus = async (tacheId: number, newStatus: string) => {
    try {
      // Utiliser la route de mise à jour du statut de employe_route.py
      const res = await fetch(`http://localhost:5000/api/employe/tache/${tacheId}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: newStatus })
      });

      if (res.ok) {
        // Mettre à jour l'état local après succès
        setTaches(taches.map(tache =>
          tache.id === tacheId
            ? { ...tache, statut: newStatus as Tache['statut'] }
            : tache
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminée': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'à_faire': return 'bg-yellow-100 text-yellow-800';
      case 'bloquée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTaches = taches.filter(tache =>
    tache.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tache.projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tache.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des tâches</h1>
          <p className="text-gray-600">Gérez et suivez toutes les tâches des projets</p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche, un projet ou un responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tableau des tâches */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTaches.map(tache => (
                  <tr key={tache.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tache.titre}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(tache.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tache.projet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tache.responsable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(tache.statut)}`}>
                        {tache.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Bouton Terminer - visible si la tâche n'est pas terminée */}
                        {tache.statut !== 'terminée' && tache.statut !== 'bloquée' && (
                          <button
                            onClick={() => updateTacheStatus(tache.id, 'terminée')}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Terminer
                          </button>
                        )}

                        {/* Bouton Recommencer - visible uniquement si la tâche est terminée */}
                        {tache.statut === 'terminée' && (
                          <button
                            onClick={() => updateTacheStatus(tache.id, 'en_cours')}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Play size={16} className="mr-1" />
                            Recommencer
                          </button>
                        )}

                        {/* Boutons Bloquer/À faire existants */}
                        {tache.statut !== 'bloquée' && (
                          <button
                            onClick={() => updateTacheStatus(tache.id, 'bloquée')}
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <AlertTriangle size={16} className="mr-1" />
                            Bloquer
                          </button>
                        )}
                        {tache.statut === 'bloquée' && (
                          <button
                            onClick={() => updateTacheStatus(tache.id, 'à_faire')}
                            className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                          >
                            <RotateCcw size={16} className="mr-1" />
                            À faire
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}