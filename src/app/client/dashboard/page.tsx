'use client';

 import SidebarClient from '@/app/component/siderbarclient';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  // Récupération des infos utilisateur depuis le localStorage
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  interface Projet {
    id: string;
    nom: string;
    description: string;
    statut: 'termine' | 'en_pause' | 'en_cours' | string;
    avancement: number;
    // Ajoutez d'autres propriétés si nécessaire
  }
  const [projets, setProjets] = useState<Projet[]>([]);
  interface Livrable {
    id: string;
    libelle: string;
    projet_nom: string;
    url: string;
    // Ajoutez d'autres propriétés si nécessaire
  }
  const [livrables, setLivrables] = useState<Livrable[]>([]);
  interface Notification {
    id: string;
    message: string;
    date: string;
    // Ajoutez d'autres propriétés si nécessaire
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);
  interface Message {
    id: string;
    auteur: string;
    contenu: string;
    date: string;
    // Ajoutez d'autres propriétés si nécessaire
  }
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    // Appels API fictifs, à remplacer par vos endpoints réels
    // Récupérer les projets du client
    fetch('/api/client/projets')
      .then(res => res.json())
      .then(data => setProjets(data))
      .catch(() => setProjets([]));
    // Récupérer les derniers livrables
    fetch('/api/client/livrables')
      .then(res => res.json())
      .then(data => setLivrables(data))
      .catch(() => setLivrables([]));
    // Récupérer les notifications
    fetch('/api/client/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(() => setNotifications([]));
    // Récupérer les messages
    fetch('/api/client/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => setMessages([]));
  }, []);

  return (
    <div className="flex">
      <SidebarClient user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-red-700 drop-shadow-lg bg-white py-4 rounded-lg shadow">
          Dashboard
        </h1>

        {/* Liste des projets */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Vos projets</h2>
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
                    <span className="text-sm text-gray-500">Avancement :</span>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                      <div className="bg-red-700 h-3 rounded-full" style={{ width: `${projet.avancement}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-700">{projet.avancement}%</span>
                  </div>
                  <a href={`/client/projets/${projet.id}`} className="text-red-700 hover:underline text-sm font-medium">Voir le détail</a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Derniers livrables */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Derniers livrables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {livrables.length === 0 ? (
              <div className="text-gray-500">Aucun livrable disponible.</div>
            ) : (
              livrables.map(livrable => (
                <div key={livrable.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">{livrable.libelle}</div>
                    <div className="text-xs text-gray-500">Projet : {livrable.projet_nom}</div>
                  </div>
                  <a href={livrable.url} download className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 text-xs">Télécharger</a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notifications récentes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Notifications récentes</h2>
          <ul>
            {notifications.length === 0 ? (
              <li className="text-gray-500">Aucune notification.</li>
            ) : (
              notifications.map(notif => (
                <li key={notif.id} className="mb-2 bg-white rounded shadow px-4 py-2 border-l-4 border-red-700">
                  <span className="text-gray-700">{notif.message}</span>
                  <span className="text-xs text-gray-400 ml-2">{notif.date}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Accès à la messagerie projet */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-800">Messagerie projet</h2>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700">
            {messages.length === 0 ? (
              <div className="text-gray-500">Aucun message pour le moment.</div>
            ) : (
              <ul>
                {messages.map(msg => (
                  <li key={msg.id} className="mb-2">
                    <span className="font-semibold text-gray-800">{msg.auteur} :</span>
                    <span className="ml-2 text-gray-700">{msg.contenu}</span>
                    <span className="ml-2 text-xs text-gray-400">{msg.date}</span>
                  </li>
                ))}
              </ul>
            )}
            <a href="/client/messages" className="text-red-700 hover:underline text-sm font-medium block mt-2">Accéder à la messagerie complète</a>
          </div>
        </section>
      </main>
    </div>
  );
}