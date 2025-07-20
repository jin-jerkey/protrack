'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/component/siderbar';

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

// Interface pour les utilisateurs retournés par l'API
interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: string;
  activite?: string;
  pays?: string;
}

// Interface simplifiée pour les clients dans le select
interface Client {
  id: number;
  nom: string;
}

const STATUTS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
  { value: 'en_pause', label: 'En pause' }
];

export default function ProjetsAdminPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [projets, setProjets] = useState<Projet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    statut: 'en_cours',
    avancement: 0,
    dateDebut: '',
    dateFinPrevue: '',
    client: ''
  });
  const router = useRouter();

  // Récupérer tous les projets
  const fetchProjets = async () => {
    const res = await fetch('http://localhost:5000/api/projet/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setProjets(data);
    } else {
      setProjets([]);
    }
  };

  // Récupérer les clients (utilisateurs dont le rôle est "client")
  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/utilisateur/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data: Utilisateur[] = await res.json();
        // Filtrer uniquement les utilisateurs avec le rôle "client"
        const clientsFiltered: Client[] = data
          .filter((utilisateur: Utilisateur) => utilisateur.role === 'client')
          .map((utilisateur: Utilisateur) => ({
            id: utilisateur.id,
            nom: utilisateur.nom
          }));
        setClients(clientsFiltered);
      } else {
        console.error('Erreur lors de la récupération des utilisateurs');
        setClients([]);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setClients([]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchProjets();
    fetchClients();
  }, []);

  // Statistiques
  const totalProjets = projets.length;
  const enCours = projets.filter(p => p.statut === 'en_cours').length;
  const termines = projets.filter(p => p.statut === 'termine').length;
  const enPause = projets.filter(p => p.statut === 'en_pause').length;

  // Filtrage
  const filteredProjets = projets.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = statutFilter === 'all' || p.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  // Création/modification projet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      nom: form.nom,
      description: form.description,
      statut: form.statut,
      avancement: form.avancement,
      dateDebut: form.dateDebut,
      dateFinPrevue: form.dateFinPrevue,
      client: form.client
    };
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/api/projet/${editId}`
      : 'http://localhost:5000/api/projet/';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Opération réussie');
        fetchProjets();
        setShowModal(false);
        setEditId(null);
        setForm({
          nom: '',
          description: '',
          statut: 'en_cours',
          avancement: 0,
          dateDebut: '',
          dateFinPrevue: '',
          client: ''
        });
      } else {
        alert(`Erreur: ${result.error || 'Une erreur est survenue'}`);
      }
    } catch {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleEdit = (p: Projet) => {
    setEditId(p.id);
    setForm({
      nom: p.nom,
      description: p.description || '',
      statut: p.statut,
      avancement: p.avancement,
      dateDebut: p.dateDebut || '',
      dateFinPrevue: p.dateFinPrevue || '',
      client: p.client
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return;
    const res = await fetch(`http://localhost:5000/api/projet/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) fetchProjets();
  };

  // Ajouter la fonction de navigation
  const handleView = (id: number) => {
    router.push(`/admin/projets/${id}`);
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-700 mb-2">Gestion des projets</h1>
            <p className="text-gray-600">Gérez vos projets et leur avancement</p>
          </div>
          <button
            className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 font-medium transition-colors"
            onClick={() => { setShowModal(true); setEditId(null); setForm({ nom: '', description: '', statut: 'en_cours', avancement: 0, dateDebut: '', dateFinPrevue: '', client: '' }); }}
          >
            Nouveau projet
          </button>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

        {/* Tableau des projets */}
        <section>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-red-800">
                Liste des projets ({filteredProjets.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.client}</td>
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
                                p.avancement < 50 ? 'bg-red-400' : p.avancement < 100 ? 'bg-yellow-400' : 'bg-green-500'
                              }`}
                              style={{ width: `${p.avancement}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{p.avancement}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
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
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Modal création/modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold mb-6 text-red-800">{editId ? 'Modifier' : 'Créer'} un projet</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du projet</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={form.statut}
                    onChange={e => setForm({ ...form, statut: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {STATUTS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avancement (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.avancement}
                    onChange={e => setForm({ ...form, avancement: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                  <input
                    type="date"
                    value={form.dateDebut}
                    onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin prévue</label>
                  <input
                    type="date"
                    value={form.dateFinPrevue}
                    onChange={e => setForm({ ...form, dateFinPrevue: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <select
                    value={form.client}
                    onChange={e => setForm({ ...form, client: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 font-medium transition-colors"
                  >
                    {editId ? 'Modifier' : 'Créer'}
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