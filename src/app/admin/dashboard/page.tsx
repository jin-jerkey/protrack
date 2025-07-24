'use client';

import Sidebar from '@/app/component/siderbar';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line} from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Interfaces

interface ChartData {
  projetsParStatut: {
    labels: string[];
    data: number[];
  };
  evolutionProjets: {
    labels: string[];
    data: number[];
  };
  performanceEquipes: {
    labels: string[];
    tachesTerminees: number[];
    tauxReussite: number[];
  };
  budgetVsDepenses: {
    labels: string[];
    budget: number[];
    depenses: number[];
  };
}

interface Activity {
  action: string;
  details: string;
  date_action: string;
  utilisateur: string;
}

interface Notification {
  id: string;
  message: string;
  date: string;
  type: string;
  utilisateur: string;
}

interface KPI {
  id: string;
  titre: string;
  valeur: string | number;
}

// Ajoutez cette interface pour les stats des projets
interface ProjectStats {
  totalProjets: number;
  projetsEnCours: number;
  projetsTermines: number;
  projetsParStatut: {
    labels: string[];
    data: number[];
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjets: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
    projetsParStatut: {
      labels: [],
      data: []
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }

    // Charger toutes les données du dashboard
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartDataRes, activitiesRes, notificationsRes, kpisRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/stats'),
          fetch('http://localhost:5000/api/dashboard/chart-data'),
          fetch('http://localhost:5000/api/dashboard/recent-activities'),
          fetch('http://localhost:5000/api/dashboard/notifications'),
          fetch('http://localhost:5000/api/dashboard/kpis')
        ]);

        await statsRes.json();
        const chartData = await chartDataRes.json();
        const activities = await activitiesRes.json();
        const notifications = await notificationsRes.json();
        const kpis = await kpisRes.json();
        console.log('KPIs reçus:', kpis); // Pour vérifier la structure des données

        // setStats(stats);
        setChartData(chartData);
        setActivities(activities);
        setNotifications(notifications);
        setKpis(Array.isArray(kpis) ? kpis : []); // S'assurer que c'est un tableau
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    // Ajouter ceci dans votre fonction fetchDashboardData
    const fetchProjectStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/project-stats');
        if (res.ok) {
          const data = await res.json();
          setProjectStats(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats projets:', error);
      }
    };

    fetchDashboardData();
    fetchProjectStats();
  }, []);

  // Configuration des graphiques
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Évolution des projets' }
    }
  };


  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-red-700 drop-shadow-lg bg-white py-4 rounded-lg shadow">
          Tableau de bord Administrateur
        </h1>

        {/* Stats des projets */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">État des Projets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
              <h3 className="text-gray-600 text-sm">Total des projets</h3>
              <p className="text-2xl font-bold text-red-700 mt-2">{projectStats.totalProjets}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 text-sm">Projets en cours</h3>
              <p className="text-2xl font-bold text-green-500 mt-2">{projectStats.projetsEnCours}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-600 text-sm">Projets terminés</h3>
              <p className="text-2xl font-bold text-blue-500 mt-2">{projectStats.projetsTermines}</p>
            </div>
          </div>

          {/* Graphique des projets */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-500">Répartition des projets par statut</h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: ['En cours', 'Terminés', 'En pause'],
                  datasets: [{
                    data: [
                      projectStats.projetsEnCours,
                      projectStats.projetsTermines,
                      projectStats.totalProjets - (projectStats.projetsEnCours + projectStats.projetsTermines)
                    ],
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.isArray(kpis) && kpis.length > 0 ? (
            kpis.map(kpi => (
              <div key={kpi.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
                <h3 className="text-gray-600 text-sm">{kpi.titre}</h3>
                <p className="text-2xl font-bold text-red-700 mt-2">{kpi.valeur}</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-4 bg-white rounded-lg shadow">
              <p className="text-gray-500">Aucun KPI disponible</p>
            </div>
          )}
        </section>

        {/* Graphiques */}
        {chartData && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-500">Répartition des projets</h3>
              <Pie 
                data={{
                  labels: chartData.projetsParStatut.labels,
                  datasets: [{
                    data: chartData.projetsParStatut.data,
                    backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6366F1']
                  }]
                }}
                options={pieChartOptions}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-500">Évolution des projets</h3>
              <Line 
                data={{
                  labels: chartData.evolutionProjets.labels,
                  datasets: [{
                    label: 'Nombre de projets',
                    data: chartData.evolutionProjets.data,
                    borderColor: '#EF4444',
                    tension: 0.1
                  }]
                }}
                options={lineChartOptions}
              />
            </div>
          </section>
        )}

        {/* Activités récentes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Activités récentes</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.utilisateur}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.date_action).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{activity.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Notifications importantes</h2>
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-700">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-1">Par {notif.utilisateur}</p>
                  </div>
                  <span className="text-xs text-gray-400">{notif.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

