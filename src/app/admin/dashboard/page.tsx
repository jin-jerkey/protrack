'use client';

import Sidebar from '@/app/component/siderbar';
import { useEffect, useState } from 'react';

// Ajout des nouvelles interfaces
interface AuditLog {
  id: number;
  action: string;
  details: string;
  date_action: string;
  utilisateur: string;
}


export default function Dashboard() {
  // Récupération des infos utilisateur depuis le localStorage
  const [user, setUser] = useState<{ nom: string; email: string }>({ nom: '', email: '' });
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjets: 0,
    projetsTermines: 0,
    projetsEnCours: 0,
    projetsEnPause: 0,
    alertes: 0,
    retards: 0,
  });
  const [notifications, setNotifications] = useState<
    { id: string; message: string; date: string }[]
  >([]);
  const [rapports, setRapports] = useState<
    { id: string; titre: string; valeur: string | number }[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  // const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
  //   totalClients: 0,
  //   totalProjets: 0,
  //   projetsTermines: 0,
  //   projetsEnCours: 0,
  //   projetsEnPause: 0,
  //   alertes: 0,
  //   retards: 0,
  //   equipes: 0,
  //   utilisateursActifs: 0,
  //   tauxCompletionProjets: 0,
  //   nombreTaches: 0,
  //   tachesTerminees: 0
  // });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    // Appels API fictifs, à remplacer par vos endpoints réels
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({
        totalClients: 12,
        totalProjets: 25,
        projetsTermines: 10,
        projetsEnCours: 12,
        projetsEnPause: 3,
        alertes: 2,
        retards: 1,
      }));
    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(() => setNotifications([
        { id: '1', message: 'Projet X en retard', date: '2025-07-15' },
        { id: '2', message: 'Nouveau client ajouté', date: '2025-07-14' },
      ]));
    fetch('/api/admin/rapports')
      .then(res => res.json())
      .then(data => setRapports(data))
      .catch(() => setRapports([
        { id: '1', titre: 'Projets en cours', valeur: 12 },
        { id: '2', titre: 'Clients actifs', valeur: 10 },
        { id: '3', titre: 'Retards', valeur: 1 },
      ]));

    // Ajout de la récupération des logs d'audit
    const fetchAuditLogs = async () => {
      const res = await fetch('http://localhost:5000/api/audit/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 ml-72 md:ml-60 sm:ml-20 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-red-700 drop-shadow-lg bg-white py-4 rounded-lg shadow">
          Tableau de bord Administrateur
        </h1>

        {/* Vue globale */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Vue globale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700 flex flex-col items-center">
              <span className="text-3xl font-bold text-red-700">{stats.totalClients}</span>
              <span className="text-gray-700 mt-2">Clients</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700 flex flex-col items-center">
              <span className="text-3xl font-bold text-red-700">{stats.totalProjets}</span>
              <span className="text-gray-700 mt-2">Projets</span>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Terminés: {stats.projetsTermines}</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">En pause: {stats.projetsEnPause}</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">En cours: {stats.projetsEnCours}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-700 flex flex-col items-center">
              <span className="text-3xl font-bold text-red-700">{stats.alertes}</span>
              <span className="text-gray-700 mt-2">Alertes</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mt-2">Retards: {stats.retards}</span>
            </div>
          </div>
        </section>

        {/* Statistiques et rapports */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Statistiques & Rapports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rapports.length === 0 ? (
              <div className="text-gray-500">Aucun rapport disponible.</div>
            ) : (
              rapports.map(rapport => (
                <div key={rapport.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-700">
                  <div className="font-bold text-gray-800">{rapport.titre}</div>
                  <div className="text-2xl text-red-700 font-extrabold mt-2">{rapport.valeur}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notifications importantes */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-800">Notifications importantes</h2>
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

        {/* Nouvelles sections */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Dernières activités</h2>
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
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.utilisateur}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.date_action).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}