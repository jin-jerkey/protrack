'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarEmploye from '@/app/component/siderbarEmploye';
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  ListTodo,
  Activity
} from 'lucide-react';

interface Tache {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  priorite: string;
  projet: string;
}

interface Statistiques {
  tachesTotal: number;
  tachesTerminees: number;
  tachesEnCours: number;
  tachesAFaire: number;
}

export default function DashboardEmploye() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [taches, setTaches] = useState<Tache[]>([]);
  const [stats, setStats] = useState<Statistiques>({
    tachesTotal: 0,
    tachesTerminees: 0,
    tachesEnCours: 0,
    tachesAFaire: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      try {
        // Récupérer les tâches de l'employé
        const resTaches = await fetch(`http://localhost:5000/api/employe/taches?userId=${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (resTaches.ok) {
          const data = await resTaches.json();
          setTaches(data);
          
          // Calculer les statistiques
          const stats = {
            tachesTotal: data.length,
            tachesTerminees: data.filter((t: Tache) => t.statut === 'terminée').length,
            tachesEnCours: data.filter((t: Tache) => t.statut === 'en_cours').length,
            tachesAFaire: data.filter((t: Tache) => t.statut === 'à_faire').length
          };
          setStats(stats);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, [router]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminée': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'à_faire': return 'bg-yellow-100 text-yellow-800';
      case 'bloquée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'bg-red-100 text-red-800';
      case 'haute': return 'bg-orange-100 text-orange-800';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex">
      <SidebarEmploye user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bonjour, {user.nom}</h1>
          <p className="text-gray-600">Voici un aperçu de vos tâches et activités</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <ListTodo className="w-12 h-12 text-blue-600" />
              <span className="text-3xl font-bold text-gray-800">{stats.tachesTotal}</span>
            </div>
            <h3 className="text-gray-600">Tâches totales</h3>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <span className="text-3xl font-bold text-gray-800">{stats.tachesTerminees}</span>
            </div>
            <h3 className="text-gray-600">Tâches terminées</h3>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-12 h-12 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-800">{stats.tachesEnCours}</span>
            </div>
            <h3 className="text-gray-600">Tâches en cours</h3>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12 text-red-600" />
              <span className="text-3xl font-bold text-gray-800">{stats.tachesAFaire}</span>
            </div>
            <h3 className="text-gray-600">Tâches à faire</h3>
          </div>
        </div>

        {/* Tâches récentes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl text-gray-700 font-semibold mb-4">Tâches récentes</h2>
          <div className="space-y-4">
            {taches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune tâche assignée</p>
            ) : (
              taches.slice(0, 5).map(tache => (
                <div
                  key={tache.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{tache.titre}</h3>
                      <p className="text-sm text-gray-600">{tache.projet}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(tache.statut)}`}>
                        {tache.statut}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPrioriteColor(tache.priorite)}`}>
                        {tache.priorite}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tache.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(tache.dateFin).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}