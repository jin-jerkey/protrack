'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SidebarEmploye from '@/app/component/siderbarEmploye';
import { Send, Search } from 'lucide-react';

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

export default function MessagePage() {
  const [user, setUser] = useState<{ id: number; nom: string; email: string }>({ id: 0, nom: '', email: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedProjet, setSelectedProjet] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [selectedDestinataire, setSelectedDestinataire] = useState<number>(0);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const router = useRouter();

  const fetchMessages = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, []);

  const fetchProjets = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/projets?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProjets(data);
        if (!selectedProjet && data.length > 0) {
          setSelectedProjet(data[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, [selectedProjet]);

  const fetchProjectUsers = useCallback(async (projectId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/users?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectUsers(data);
        setSelectedDestinataire(0);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetchMessages(parsedUser.id);
    fetchProjets(parsedUser.id);

    const interval = setInterval(() => fetchMessages(parsedUser.id), 30000);
    return () => clearInterval(interval);
  }, [router, fetchMessages, fetchProjets]);

  useEffect(() => {
    if (selectedProjet) {
      fetchProjectUsers(selectedProjet);
    }
  }, [selectedProjet, fetchProjectUsers]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjet || !selectedDestinataire) return;

    try {
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
          destinataireId: selectedDestinataire
        })
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(user.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredMessages = messages.filter(msg =>
    selectedProjet ? msg.projetId === selectedProjet : true
  ).filter(msg =>
    msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.envoyeurNom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <SidebarEmploye user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Messages</h1>
            <p className="text-gray-600">Communiquez avec votre équipe</p>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedProjet || '0'}
              onChange={(e) => setSelectedProjet(Number(e.target.value))}
              className="border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Tous les projets</option>
              {projets.map(projet => (
                <option key={projet.id} value={projet.id}>
                  {projet.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Liste des messages */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-[calc(100vh-400px)] overflow-y-auto">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`mb-4 p-4 rounded-lg ${
                  msg.envoyeurId === user.id
                    ? 'bg-blue-50 ml-auto mr-0 max-w-2xl'
                    : 'bg-gray-50 mr-auto ml-0 max-w-2xl'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{msg.envoyeurNom}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(msg.date).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="text-gray-700 mb-2">{msg.message}</div>
                <div className="text-sm text-gray-500">Projet: {msg.projetNom}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={sendMessage} className="flex gap-4">
            <select
              value={selectedProjet || ''}
              onChange={(e) => {
                const newProjectId = Number(e.target.value);
                setSelectedProjet(newProjectId);
                if (newProjectId) {
                  fetchProjectUsers(newProjectId);
                }
              }}
              className="border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un projet</option>
              {projets.map(projet => (
                <option key={projet.id} value={projet.id}>{projet.nom}</option>
              ))}
            </select>

            <select
              value={selectedDestinataire || ''}
              onChange={(e) => setSelectedDestinataire(Number(e.target.value))}
              className="border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un destinataire</option>
              {projectUsers
                .filter(u => u.id !== user.id)
                .map(user => (
                  <option key={user.id} value={user.id}>{user.nom}</option>
              ))}
            </select>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={!newMessage.trim() || !selectedProjet}
            >
              <Send size={20} />
              Envoyer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
