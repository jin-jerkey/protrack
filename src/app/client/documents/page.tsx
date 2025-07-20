'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarClient from '@/app/component/siderbarclient';

interface Document {
  id: number;
  titre: string;
  date: string;
  chemin: string;
  type: string;
  projet: string;
  projetId: number;
}

export default function DocumentsPage() {
  const [user, setUser] = useState<{ id: number; nom: string; email: string }>({ id: 0, nom: '', email: '' });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userData);
      setUser(user);

      try {
        const res = await fetch(`http://localhost:5000/api/client/documents/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchDocuments();
  }, [router]);

  const filteredDocuments = documents.filter(doc =>
    doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.projet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <SidebarClient user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Documents</h1>
          <p className="text-gray-600">Consultez les documents liés à vos projets</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un document..."
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-800">{doc.titre}</h3>
                    <p className="text-sm text-gray-500">Projet: {doc.projet}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(doc.date).toLocaleDateString()}</span>
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
      </main>
    </div>
  );
}