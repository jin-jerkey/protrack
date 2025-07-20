'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/component/siderbar';

interface Livrable {
  id: string;
  url: string;
  libelle: string;
}

interface Projet {
  id: string;
  nom: string;
  description: string;
  client_nom: string;
  dateDebut: string;
  dateFinPrevue: string;
  etapes: string;
  statut: string;
  livrables?: Livrable[];
}

export default function ProjetsAdminPage() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [projets, setProjets] = useState<Projet[]>([]);
  interface Client {
    id: string;
    nom: string;
    role: string; // Ajoute la propriété 'role'
    // Ajoute d'autres propriétés si nécessaire
  }
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    clientId: '',
    dateDebut: '',
    dateFinPrevue: '',
    etapes: '',
  });
  const [ , setLivrableFile] = useState<File | null>(null);

  // Méthode pour récupérer uniquement les clients (role = 'client') via l'API utilisateur
  const fetchClients = async () => {
    const res = await fetch('/api/utilisateur/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      // Filtrer les utilisateurs pour ne garder que ceux dont le rôle est "client"
      const clientsOnly = data.filter((user: { role: string }) => user.role === 'client');
      setClients(clientsOnly);
    } else {
      setClients([]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    // Récupérer les projets
    fetch('/api/projets/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => res.json())
      .then(data => setProjets(data))
      .catch(() => setProjets([]));
    // Récupérer les clients via la nouvelle méthode
    fetchClients();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLivrableFile(e.target.files[0]);
    }
  };

  const handleCreateProjet = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      nom: form.nom,
      description: form.description,
      client_id: form.clientId,
      date_debut: form.dateDebut,
      date_fin_prevue: form.dateFinPrevue
    };
    const res = await fetch('/api/projets/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      // Recharger la liste des projets après création
      fetch('/api/projets/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
        .then(res => res.json())
        .then(data => setProjets(data));
      setForm({
        nom: '',
        description: '',
        clientId: '',
        dateDebut: '',
        dateFinPrevue: '',
        etapes: '',
      });
      setLivrableFile(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Gestion des projets</h1>

        {/* Création de projet */}
        <section className="mb-10 bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Créer un projet</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreateProjet}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                name="clientId"
                value={form.clientId}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Sélectionner un client</option>
                {/* Affiche uniquement les utilisateurs dont le rôle est "client" */}
                {clients
                  .filter(client => client.role === 'client')
                  .map(client => (
                    <option key={client.id} value={client.id}>{client.nom}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin prévue</label>
              <input
                type="date"
                name="dateFinPrevue"
                value={form.dateFinPrevue}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Étapes du projet</label>
              <textarea
                name="etapes"
                value={form.etapes}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={2}
                placeholder="Décrivez les étapes importantes du projet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléversement d&apos;un livrable</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-800 font-semibold"
              >
                Créer le projet
              </button>
            </div>
          </form>
        </section>

        {/* Liste des projets */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-800">Liste des projets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projets.length === 0 ? (
              <div className="text-gray-500">Aucun projet pour le moment.</div>
            ) : (
              projets.map(projet => (
                <div key={projet.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">{projet.nom}</span>
                    <span className={`px-2 py-1 rounded text-xs ${projet.statut === 'termine' ? 'bg-green-100 text-green-700' : projet.statut === 'en_pause' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {projet.statut}
                    </span>
                  </div>
                  <div className="mb-2 text-gray-600">{projet.description}</div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Client :</span>
                    <span className="ml-2 text-gray-700">{projet.client_nom}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Dates :</span>
                    <span className="ml-2 text-gray-700">{projet.dateDebut} → {projet.dateFinPrevue}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Étapes :</span>
                    <span className="ml-2 text-gray-700">{projet.etapes}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Livrables :</span>
                    {projet.livrables && projet.livrables.length > 0 ? (
                      <ul>
                        {projet.livrables.map((livrable: Livrable) => (
                          <li key={livrable.id}>
                            <a href={livrable.url} download className="text-red-700 hover:underline text-sm">{livrable.libelle}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="ml-2 text-gray-400">Aucun livrable</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}