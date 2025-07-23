'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarClient from '@/app/component/siderbarclient';

interface Projet {
  id: number;
  nom: string;
  description?: string;
  statut: string;
  avancement: number;
  dateDebut?: string;
  dateFinPrevue?: string;
  client: string;
}


// Interface simplifiée pour les clients dans le select

const STATUTS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'en_pause', label: 'En pause' }
];

export default function ProjetsClientPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [projets, setProjets] = useState<Projet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  // const [editId, setEditId] = useState<number | null>(null);
  // const [form, setForm] = useState({
  //   nom: '',
  //   description: '',
  //   statut: 'en_cours',
  //   avancement: 0,
  //   dateDebut: '',
  //   dateFinPrevue: '',
  //   client: ''
  // });
  const router = useRouter();

  useEffect(() => {
    const fetchProjets = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/'); // Redirection si non connecté
        return;
      }
      
      const user = JSON.parse(userData);
      try {
        const res = await fetch(`http://localhost:5000/api/projet/client/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProjets(data);
        } else {
          setProjets([]);
          if (res.status === 401) {
            router.push('/'); // Redirection si token invalide
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        setProjets([]);
      }
    };

    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchProjets();
  }, [router]);

  // Statistiques
  const totalProjets = projets.length;
  const enCours = projets.filter(p => p.statut === 'en_cours').length;
  const termines = projets.filter(p => p.statut === 'termine').length;
  const enPause = projets.filter(p => p.statut === 'en_pause').length;

  // Filtrage
  const filteredProjets = projets.filter(p => {
    // Ne filtrer que sur le nom du projet car le client n'est plus pertinent dans la vue client
    const matchesSearch = p.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = statutFilter === 'all' || p.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  // Ajouter la fonction de navigation
  const handleView = (id: number) => {
    router.push(`/client/projets/${id}`);
  };

  return (
    <div className="flex">
      <SidebarClient user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        {/* Header - Supprimer le bouton "Nouveau projet" */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Mes projets</h1>
          <p className="text-gray-600">Suivez l&apos;avancement de vos projets</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M9 17H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2h-4m-6 0v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-800">{totalProjets}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">En cours</div>
                <div className="text-2xl font-bold text-blue-700">{enCours}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Terminés</div>
                <div className="text-2xl font-bold text-green-700">{termines}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">En pause</div>
                <div className="text-2xl font-bold text-yellow-700">{enPause}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtre */}
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut</label>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tous les statuts</option>
                {STATUTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Modification du tableau des projets */}
        <section>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-red-800">
                Liste de mes projets ({filteredProjets.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        Aucun projet trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredProjets.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.nom}</div>
                          <div className="text-xs text-gray-500">{p.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            p.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                            p.statut === 'termine' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {STATUTS.find(s => s.value === p.statut)?.label || p.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                p.avancement < 50 ? 'bg-red-400' : 
                                p.avancement < 100 ? 'bg-yellow-400' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${p.avancement}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{p.avancement}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleView(p.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Voir les détails"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}