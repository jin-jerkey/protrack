'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';
import { FileText, Search, Plus } from 'lucide-react';

interface Document {
  id: number;
  titre: string;
  type: string;
  projet: string;
  date: string;
  chemin: string;
  taille?: number;
  visibility: 'publique' | 'privee';
}

interface Projet {
  id: number;
  nom: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProjet, setSelectedProjet] = useState('all');
  const [projets, setProjets] = useState<Projet[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    titre: '',
    projetId: '',
    visibility: 'privee',
    file: null as File | null
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
        // Récupérer les documents
        const resDocuments = await fetch('http://localhost:5000/api/documents/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resDocuments.ok) {
          const data = await resDocuments.json();
          setDocuments(data);
        }

        // Récupérer les projets
        const resProjets = await fetch('http://localhost:5000/api/projet/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resProjets.ok) {
          const data = await resProjets.json();
          setProjets(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, [router]);

  // Filtrage des documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.projet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesProjet = selectedProjet === 'all' || doc.projet === selectedProjet;
    return matchesSearch && matchesType && matchesProjet;
  });

  // Gestion de l'upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.file) return;

    const formData = new FormData();
    formData.append('file', newDocument.file);
    formData.append('titre', newDocument.titre);
    formData.append('projetId', newDocument.projetId);
    formData.append('visibility', newDocument.visibility);

    try {
      const res = await fetch('http://localhost:5000/api/documents/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (res.ok) {
        setShowUploadModal(false);
        // Rafraîchir la liste des documents
        const resDocuments = await fetch('http://localhost:5000/api/documents/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (resDocuments.ok) {
          const data = await resDocuments.json();
          setDocuments(data);
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
            <h1 className="text-3xl font-bold text-red-700 mb-2">Gestion documentaire</h1>
            <p className="text-gray-600">Gérez et organisez les documents des projets</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un document
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="xls">Excel</option>
            <option value="img">Image</option>
          </select>
          <select
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tous les projets</option>
            {projets.map(projet => (
              <option key={projet.id} value={projet.id}>{projet.nom}</option>
            ))}
          </select>
        </div>

        {/* Liste des documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-800">{doc.titre}</h3>
                    <p className="text-sm text-gray-500">Projet: {doc.projet}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(doc.date).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full ${
                  doc.visibility === 'publique' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {doc.visibility}
                </span>
              </div>
              <div className="mt-4 flex justify-end">
                <a
                  href={doc.chemin}
                  download
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Télécharger
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal d'upload */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Ajouter un document</h2>
              <form onSubmit={handleUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du document
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocument.titre}
                      onChange={(e) => setNewDocument({...newDocument, titre: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projet associé
                    </label>
                    <select
                      required
                      value={newDocument.projetId}
                      onChange={(e) => setNewDocument({...newDocument, projetId: e.target.value})}
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
                      Visibilité
                    </label>
                    <select
                      value={newDocument.visibility}
                      onChange={(e) => setNewDocument({...newDocument, visibility: e.target.value as 'publique' | 'privee'})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="privee">Privé</option>
                      <option value="publique">Public</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichier
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setNewDocument({...newDocument, file: e.target.files?.[0] || null})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Uploader
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