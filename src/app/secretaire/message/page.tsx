'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import SidebarSecretaire from '@/app/component/siderbarsecretaire';

interface Message {
  id: number;
  message: string;
  date: string;
  envoyeurId: number;
  envoyeurNom: string;
  envoyeurEmail: string;
  projetId: number;
  projetNom: string;
  destinataireId?: number;
  destinataireNom?: string;
  lu?: boolean;
}

interface Projet {
  id: number;
  nom: string;
}

interface ProjectUser {
  id: number;
  nom: string;
  email: string;
}


// MÊME IMPORTS

export default function MessageSecretairePage() {
  const [user, setUser] = useState<{ id: number; nom: string; email: string }>({ id: 0, nom: '', email: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<ProjectUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedProjet, setSelectedProjet] = useState<number>(0);
  const [selectedDestinataire, setSelectedDestinataire] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, nonLus: 0 });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const router = useRouter();

  const fetchMessages = useCallback(async (userId: number) => {
    const res = await fetch(`http://localhost:5000/api/messages?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    }
  }, []);

  const fetchProjets = useCallback(async () => {
    const res = await fetch('http://localhost:5000/api/messages/admin/projets', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProjets(data);
    }
  }, []);

  const fetchUtilisateurs = useCallback(async () => {
    const res = await fetch('http://localhost:5000/api/messages/admin/utilisateurs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUtilisateurs(data);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/');
    const parsed = JSON.parse(userData);
    setUser(parsed);
    fetchMessages(parsed.id);
    fetchProjets();
    fetchUtilisateurs();

    const interval = setInterval(() => fetchMessages(parsed.id), 30000);
    return () => clearInterval(interval);
  }, [router, fetchMessages, fetchProjets, fetchUtilisateurs]);

  useEffect(() => {
    setStats({
      total: messages.length,
      nonLus: messages.filter(m => !m.lu && m.destinataireId === user.id).length,
    });
  }, [messages, user.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjet || !selectedDestinataire) return;

    const res = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contenu: newMessage,
        projetId: selectedProjet,
        userId: user.id,
        userName: user.nom,
        destinataireId: selectedDestinataire,
      }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages(user.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredMessages = messages
    .filter(msg => (selectedProjet ? msg.projetId === selectedProjet : true))
    .filter(msg =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.envoyeurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.destinataireNom && msg.destinataireNom.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="flex">
      <SidebarSecretaire user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Messages Admin</h1>
            <p className="text-gray-600">Communiquez avec les utilisateurs</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total des messages</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.nonLus}</div>
              <div className="text-sm text-gray-600">Messages non lus</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-700 text-gray-700 rounded-lg px-4 py-2"
            />
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(Number(e.target.value))}
              className="border text-gray-700 border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="">Tous les projets</option>
              {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>

          {/* Liste des messages */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-[calc(100vh-400px)] overflow-y-auto">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={`mb-4 p-4 rounded-lg ${msg.envoyeurId === user.id ? 'bg-blue-50 ml-auto' : 'bg-gray-50 mr-auto'} max-w-2xl`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{msg.envoyeurNom}</div>
                    {msg.destinataireNom && <div className="text-sm">à {msg.destinataireNom}</div>}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(msg.date).toLocaleString('fr-FR')}</div>
                </div>
                <div className="text-gray-700">{msg.message}</div>
                <div className="text-sm text-gray-500">Projet: {msg.projetNom}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire */}
          <form onSubmit={sendMessage} className="flex gap-4">
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(Number(e.target.value))}
              className="border text-gray-700 border-gray-700 rounded-lg px-4 py-2"
              required
            >
              <option value="">Projet</option>
              {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            <select
              value={selectedDestinataire}
              onChange={(e) => setSelectedDestinataire(Number(e.target.value))}
              className="border text-gray-700 border-gray-700 rounded-lg px-4 py-2 min-w-[200px]"
              required
            >
              <option value="">Destinataire</option>
              {utilisateurs.map(u => (
                <option key={u.id} value={u.id}>{u.nom}</option>
              ))}
            </select>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border text-gray-700 border-gray-700 rounded-lg px-4 py-2"
              placeholder="Écrire un message..."
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Send size={20} /> Envoyer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

