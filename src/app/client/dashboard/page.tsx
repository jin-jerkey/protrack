'use client';

import SidebarClient from '@/app/component/siderbarclient';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardStats {
  projetsActifs: number;
  totalProjets: number;
  tachesEnCours: number;
  documents: number;
}

interface ChartData {
  avancementProjets: {
    labels: string[];
    data: number[];
  };
  distributionTaches: {
    labels: string[];
    data: number[];
  };
}


interface Document {
  id: string;
  libelle: string;
  projet_nom: string;
  url: string;
  date_partage: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; nom: string; email: string }>({ id: '', nom: '', email: '' });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  // const [projetsRecents, setProjetsRecents] = useState<Projet[]>([]);
  const [documentsRecents, setDocumentsRecents] = useState<Document[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Charger les données du dashboard
        Promise.all([
          fetch(`http://localhost:5000/api/client/dashboard/stats?client_id=${parsedUser.id}`),
          fetch(`http://localhost:5000/api/client/dashboard/chart-data?client_id=${parsedUser.id}`),
          // fetch(`/api/client/projets/recents?client_id=${parsedUser.id}`), // Removed unused fetch
          fetch(`/api/client/documents/recents?client_id=${parsedUser.id}`)
        ]).then(async ([statsRes, chartDataRes, documentsRes]) => {
          const stats = await statsRes.json();
          const chartData = await chartDataRes.json();
          const documents = await documentsRes.json();

          setStats(stats);
          setChartData(chartData);
          setDocumentsRecents(documents);
        }).catch(error => {
          console.error('Erreur lors du chargement des données:', error);
        });
      }
    }
  }, []);

  return (
    <div className="flex">
      <SidebarClient user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-red-700 drop-shadow-lg bg-white py-4 rounded-lg shadow">
          Tableau de bord Client
        </h1>

        {/* KPIs */}
        {stats && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
              <h3 className="text-gray-600 text-sm">Projets actifs</h3>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.projetsActifs}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
              <h3 className="text-gray-600 text-sm">Total projets</h3>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.totalProjets}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
              <h3 className="text-gray-600 text-sm">Tâches en cours</h3>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.tachesEnCours}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700">
              <h3 className="text-gray-600 text-sm">Documents partagés</h3>
              <p className="text-2xl font-bold text-red-700 mt-2">{stats.documents}</p>
            </div>
          </section>
        )}

        {/* Graphiques */}
        {chartData && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Avancement des projets</h3>
              <Bar 
                data={{
                  labels: chartData.avancementProjets.labels,
                  datasets: [{
                    label: 'Avancement (%)',
                    data: chartData.avancementProjets.data,
                    backgroundColor: '#EF4444'
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const }
                  }
                }}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Distribution des tâches</h3>
              <Pie 
                data={{
                  labels: chartData.distributionTaches.labels,
                  datasets: [{
                    data: chartData.distributionTaches.data,
                    backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6366F1']
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' as const }
                  }
                }}
              />
            </div>
          </section>
        )}

        {/* Documents récents */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Documents récents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentsRecents.length === 0 ? (
              <div className="text-gray-500">Aucun document disponible.</div>
            ) : (
              documentsRecents.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">{doc.libelle}</div>
                    <div className="text-xs text-gray-500">
                      Projet : {doc.projet_nom}
                      <span className="ml-2">{new Date(doc.date_partage).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a href={doc.url} download className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 text-xs">
                    Télécharger
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}