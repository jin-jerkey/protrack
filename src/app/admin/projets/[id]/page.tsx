'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/app/component/siderbar';

interface Tache {
  id: number;
  titre: string;
  description?: string;
  statut: string;
  priorite: string;
  dateDebut?: string;
  dateFin?: string;
  dateCreation?: string;
  dateFinReelle?: string;
  responsable: string;
}

interface ProjetDetail {
  id: number;
  nom: string;
  description?: string;
  statut: string;
  avancement: number;
  dateDebut?: string;
  dateFinPrevue?: string;
  client: string;
  nbTaches: number;
  nbTachesTerminees: number;
}

// Ajouter cette interface pour les utilisateurs
interface Utilisateur {
  id: number;
  nom: string;
  role: string;
}

export default function DetailProjetPage() {
  const params = useParams();
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [projet, setProjet] = useState<ProjetDetail | null>(null);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    statut: 'à_faire',
    priorite: 'moyenne',
    dateDebut: '',
    dateFin: '',
    dateFinReelle: '',
    id_user_assigne: ''
  });
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);

  // Récupérer les détails du projet
  const fetchProjetDetails = useCallback(async () => {
    const res = await fetch(`http://localhost:5000/api/projet/${params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setProjet(data);
    }
  }, [params.id]);

  // Récupérer les tâches du projet
  const fetchTaches = useCallback(async () => {
    const res = await fetch(`http://localhost:5000/api/projet/${params.id}/taches`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setTaches(data);
    }
  }, [params.id]);

  // Dans useEffect, ajouter la récupération des utilisateurs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchProjetDetails();
    fetchTaches();

    // Récupérer les utilisateurs
    const fetchUtilisateurs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/utilisateur/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUtilisateurs(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    
    fetchUtilisateurs();
  }, [params.id, fetchProjetDetails, fetchTaches]);

  // Gestion des tâches
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/api/tache/${editId}`
      : `http://localhost:5000/api/projet/${params.id}/tache`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchTaches();
        setShowModal(false);
        setEditId(null);
        setForm({
          titre: '',
          description: '',
          statut: 'à_faire',
          priorite: 'moyenne',
          dateDebut: '',
          dateFin: '',
          dateFinReelle: '',
          id_user_assigne: ''
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        {/* En-tête du projet */}
        {projet && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-700 mb-2">{projet.nom}</h1>
            <p className="text-gray-600">{projet.description}</p>
          </div>
        )}

        {/* Stats du projet */}
        {projet && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total tâches</div>
                  <div className="text-2xl font-bold text-gray-800">{projet.nbTaches}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">En cours</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {taches.filter(t => t.statut === 'en_cours').length}
                  </div>
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
                  <div className="text-sm text-gray-600">Terminées</div>
                  <div className="text-2xl font-bold text-green-700">{projet.nbTachesTerminees}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bloquées</div>
                  <div className="text-2xl font-bold text-red-700">
                    {taches.filter(t => t.statut === 'bloquée').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression du projet */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">Avancement global</h3>
                <div className="text-lg">
                  <span className="font-bold text-gray-900">{projet.avancement}%</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({projet.nbTachesTerminees}/{projet.nbTaches} tâches)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    projet.avancement < 30 ? 'bg-red-500' :
                    projet.avancement < 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${projet.avancement}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Recherche de tâches */}
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button
              onClick={() => { setShowModal(true); setEditId(null); }}
              className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 font-medium ml-4"
            >
              Nouvelle tâche
            </button>
          </div>
        </section>

        {/* Liste des tâches */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taches
            .filter(t => t.titre.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(tache => (
              <div key={tache.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{tache.titre}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tache.statut === 'terminée' ? 'bg-green-100 text-green-800' :
                    tache.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                    tache.statut === 'bloquée' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tache.statut}
                  </span>
                </div>
                
                {tache.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tache.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>
                      Créée le: {tache.dateCreation ? new Date(tache.dateCreation).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  {tache.dateDebut && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Début prévu: {new Date(tache.dateDebut).toLocaleDateString()}</p>
                    </div>
                  )}

                  {tache.dateFin && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Fin prévue: {new Date(tache.dateFin).toLocaleDateString()}</p>
                    </div>
                  )}

                  {tache.dateFinReelle && (
                    <div className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Terminée le: {new Date(tache.dateFinReelle).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setForm({
                        titre: tache.titre,
                        description: tache.description || '',
                        statut: tache.statut,
                        dateDebut: tache.dateDebut || '',
                        dateFin: tache.dateFin || '',
                        priorite: tache.priorite || 'moyenne',
                        dateFinReelle: tache.dateFinReelle || '',
                        id_user_assigne: tache.responsable || ''
                      });
                      setEditId(tache.id);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
        </section>

        {/* Modal d'ajout/modification de tâche */}
        {showModal && (
          <div className="fixed inset-0 border-gray-900 shadow-gray-900 text-gray-700  bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editId ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titre}
                    onChange={e => setForm({ ...form, titre: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                {/* Statut et Priorité */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Statut
                    </label>
                    <select
                      value={form.statut}
                      onChange={e => setForm({ ...form, statut: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="à_faire">À faire</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminée">Terminée</option>
                      <option value="bloquée">Bloquée</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Priorité
                    </label>
                    <select
                      value={form.priorite}
                      onChange={e => setForm({ ...form, priorite: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="faible">Faible</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                      <option value="critique">Critique</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={form.dateDebut}
                      onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date de fin prévue
                    </label>
                    <input
                      type="date"
                      value={form.dateFin}
                      onChange={e => setForm({ ...form, dateFin: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Date de fin réelle (visible uniquement si statut = terminée) */}
                {form.statut === 'terminée' && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date de fin réelle
                    </label>
                    <input
                      type="date"
                      value={form.dateFinReelle}
                      onChange={e => setForm({ ...form, dateFinReelle: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                {/* Assignation utilisateur */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Assigner à
                  </label>
                  <select
                    value={form.id_user_assigne}
                    onChange={e => setForm({ ...form, id_user_assigne: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Sélectionner un responsable</option>
                    {utilisateurs.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nom} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editId ? 'Enregistrer' : 'Créer'}
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