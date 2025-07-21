'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { Plus, Edit, Trash2, Users, X } from 'lucide-react';

interface Equipe {
  id: number;
  nom: string;
  description: string;
  nombreMembres: number;
}

interface Membre {
  id: number;
  nom: string;
  role: string;
}

export default function EquipesPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'members'>('create');
  const [selectedEquipe, setSelectedEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    membres: [] as number[]
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
        // Récupérer les équipes
        const resEquipes = await fetch('http://localhost:5000/api/equipe/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resEquipes.ok) {
          const data = await resEquipes.json();
          setEquipes(data);
        }

        // Récupérer les membres potentiels
        const resMembres = await fetch('http://localhost:5000/api/utilisateur/assignables', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resMembres.ok) {
          const data = await resMembres.json();
          setMembres(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'create' || modalType === 'edit') {
        const url = modalType === 'create' 
          ? 'http://localhost:5000/api/equipe/'
          : `http://localhost:5000/api/equipe/${selectedEquipe?.id}`;
        
        const res = await fetch(url, {
          method: modalType === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            nom: formData.nom,
            description: formData.description
          })
        });

        if (res.ok) {
          const data = await res.json();
          
          // Si création, ajouter les membres
          if (modalType === 'create' && formData.membres.length > 0) {
            await Promise.all(formData.membres.map(memberId =>
              fetch(`http://localhost:5000/api/equipe/${data.id}/membres`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ userId: memberId })
              })
            ));
          }

          // Rafraîchir les équipes
          const resEquipes = await fetch('http://localhost:5000/api/equipe/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          if (resEquipes.ok) {
            const data = await resEquipes.json();
            setEquipes(data);
          }
        }
      } else if (modalType === 'delete' && selectedEquipe) {
        const res = await fetch(`http://localhost:5000/api/equipe/${selectedEquipe.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (res.ok) {
          setEquipes(equipes.filter(e => e.id !== selectedEquipe.id));
        }
      }

      setShowModal(false);
      setFormData({ nom: '', description: '', membres: [] });
      setSelectedEquipe(null);
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
            <h1 className="text-3xl font-bold text-red-700 mb-2">Gestion des équipes</h1>
            <p className="text-gray-600">Créez et gérez les équipes de travail</p>
          </div>
          <button
            onClick={() => {
              setModalType('create');
              setShowModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle équipe
          </button>
        </div>

        {/* Liste des équipes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipes.map(equipe => (
            <div key={equipe.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{equipe.nom}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedEquipe(equipe);
                      setFormData({
                        nom: equipe.nom,
                        description: equipe.description,
                        membres: []
                      });
                      setModalType('edit');
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEquipe(equipe);
                      setModalType('delete');
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{equipe.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                {equipe.nombreMembres} membres
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {modalType === 'create' ? 'Nouvelle équipe' :
                   modalType === 'edit' ? 'Modifier l\'équipe' :
                   modalType === 'delete' ? 'Supprimer l\'équipe' :
                   'Gérer les membres'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l&apos;équipe
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows={3}
                    />
                  </div>

                  {modalType === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Membres
                      </label>
                      <select
                        multiple
                        value={formData.membres.map(String)}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                          setFormData({...formData, membres: selected});
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        {membres.map(membre => (
                          <option key={membre.id} value={membre.id}>
                            {membre.nom} ({membre.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {modalType === 'create' ? 'Créer' : 'Modifier'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}