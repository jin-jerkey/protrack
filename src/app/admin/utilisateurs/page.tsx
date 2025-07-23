'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/component/siderbar';

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: string;
  activite?: string;
  pays?: string;
}

export default function UtilisateursAdminPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<{
    nom: string;
    email: string;
    telephone: string;
    role: string;
    activite: string;
    pays: string;
    password?: string;
  }>({
    nom: '',
    email: '',
    telephone: '',
    role: 'client',
    activite: '',
    pays: '',
    password: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  // Récupérer tous les utilisateurs
  const fetchUtilisateurs = async () => {
    const res = await fetch('http://localhost:5000/api/utilisateur/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Utilisateurs reçus:', data);
      setUtilisateurs(data);
    } else {
      setUtilisateurs([]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchUtilisateurs();
  }, []);

  // Filtrer les utilisateurs
  const filteredUtilisateurs = utilisateurs.filter(u => {
    const matchesSearch = u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculer les statistiques
  const totalUsers = utilisateurs.length;
  const adminCount = utilisateurs.filter(u => u.role === 'admin').length;
  const chefProjetCount = utilisateurs.filter(u => u.role === 'administratif').length;
  const membresCount = utilisateurs.filter(u => u.role === 'client' || u.role === 'secretaire').length;

  // Création ou modification d'utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: {
      nom: string;
      email: string;
      password?: string;
      telephone: string;
      activite: string;
      pays: string;
      role: string;
    } = {
      nom: form.nom,
      email: form.email,
      password: form.password,
      telephone: form.telephone,
      activite: form.activite,
      pays: form.pays,
      role: form.role
    };

    if (editId && !form.password) {
      delete body.password;
    }

    if (!editId && !form.password) {
      alert('Le mot de passe est requis pour la création.');
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/api/utilisateur/${editId}`
      : 'http://localhost:5000/api/utilisateur/';

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
        fetchUtilisateurs();
        setForm({
          nom: '',
          email: '',
          telephone: '',
          role: 'client',
          activite: '',
          pays: '',
          password: ''
        });
        setEditId(null);
      } else {
        alert(`Erreur: ${result.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la requête:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const handleEdit = (u: Utilisateur) => {
    setEditId(u.id);
    setForm({
      nom: u.nom,
      email: u.email,
      telephone: u.telephone || '',
      role: u.role,
      activite: u.activite || '',
      pays: u.pays || '',
      password: ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return;
    const res = await fetch(`http://localhost:5000/api/utilisateur/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      fetchUtilisateurs();
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Directeur General';
      case 'administratif': return 'Directeur Prestataire';
      case 'secretaire': return 'Secretaire';
      case 'client': return 'Client';
      case 'employe': return 'Employe';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'administratif': return 'bg-blue-100 text-blue-800';
      case 'secretaire': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      case 'employe': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les membres de votre équipe et leurs permissions</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-800">{totalUsers}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Administrateurs</div>
                <div className="text-2xl font-bold text-red-700">{adminCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Chefs de projet</div>
                <div className="text-2xl font-bold text-blue-700">{chefProjetCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Membres</div>
                <div className="text-2xl font-bold text-green-700">{membresCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire création/modification */}
        <section className="mb-8 bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
          <h2 className="text-xl font-semibold mb-6 text-red-800">{editId ? 'Modifier' : 'Créer'} un utilisateur</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input 
                type="text" 
                name="nom" 
                value={form.nom} 
                onChange={e => setForm({ ...form, nom: e.target.value })} 
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                className="w-full border border-gray-700  text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input 
                type="text" 
                name="telephone" 
                value={form.telephone} 
                onChange={e => setForm({ ...form, telephone: e.target.value })} 
                className="w-full border border-gray-700 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select 
                name="role" 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })} 
                className="w-full border border-gray-700 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                required
              >
                <option value="client">Client</option>
                <option value="admin">Directeur General</option>
                <option value="administratif">Directeur Prestataire</option>
                <option value="secretaire">Secretaire</option>
                <option value="employe">Employe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activité</label>
              <input 
                type="text" 
                name="activite" 
                value={form.activite} 
                onChange={e => setForm({ ...form, activite: e.target.value })} 
                className="w-full border border-gray-700 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <input 
                type="text" 
                name="pays" 
                value={form.pays} 
                onChange={e => setForm({ ...form, pays: e.target.value })} 
                className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe {editId ? '(laisser vide pour ne pas changer)' : ''}
              </label>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                required={!editId} 
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              {editId && (
                <button 
                  type="button" 
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => { 
                    setEditId(null); 
                    setForm({ nom: '', email: '', telephone: '', role: 'client', activite: '', pays: '', password: '' }); 
                  }}
                >
                  Annuler
                </button>
              )}
              <button 
                type="submit" 
                className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 font-medium transition-colors"
              >
                {editId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </section>

        {/* Filtres et recherche */}
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par rôle</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Directeur General</option>
                    <option value="administratif">Directeur Prestataire</option>
                    <option value="secretaire">Secretaire</option>
                    <option value="client">Client</option>
                    <option value="employe">Employe</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="showArchived"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showArchived" className="ml-2 text-sm text-gray-700">
                    Afficher les utilisateurs archivés
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liste des utilisateurs */}
        <section>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-red-800">
                Liste des utilisateurs ({filteredUtilisateurs.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messagerie électronique
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUtilisateurs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUtilisateurs.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-700 font-medium text-sm">
                                  {u.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.nom}</div>
                              <div className="text-sm text-gray-500">Réf: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(u.role)}`}>
                            {getRoleDisplayName(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.email || 'Non renseigné'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Voir"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
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
      </main>
    </div>
  );
}