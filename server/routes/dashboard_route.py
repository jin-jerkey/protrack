from flask import Blueprint, request, jsonify
from db import create_db_connection
from datetime import datetime, timedelta
import calendar

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Récupère les statistiques principales du dashboard"""
    try:
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Projets actifs
        cursor.execute("SELECT COUNT(*) as count FROM projet WHERE Statut_projet = 'en_cours'")
        projets_actifs = cursor.fetchone()['count']
        
        # Total clients
        cursor.execute("SELECT COUNT(*) as count FROM utilisateur WHERE Role = 'client'")
        total_clients = cursor.fetchone()['count']
        
        # Total projets
        cursor.execute("SELECT COUNT(*) as count FROM projet")
        total_projets = cursor.fetchone()['count']
        
        # Projets terminés
        cursor.execute("SELECT COUNT(*) as count FROM projet WHERE Statut_projet = 'termine'")
        projets_termines = cursor.fetchone()['count']
        
        # Projets en pause
        cursor.execute("SELECT COUNT(*) as count FROM projet WHERE Statut_projet = 'en_pause'")
        projets_en_pause = cursor.fetchone()['count']
        
        # Projets en retard (date fin prévue dépassée)
        cursor.execute("""
            SELECT COUNT(*) as count FROM projet 
            WHERE DateFinPrevue < CURDATE() AND Statut_projet != 'termine'
        """)
        projets_en_retard = cursor.fetchone()['count']
        
        # Notifications non lues
        cursor.execute("SELECT COUNT(*) as count FROM notification WHERE Lu = 0")
        alertes = cursor.fetchone()['count']
        
        # Taux de complétion global
        taux_completion = (projets_termines / total_projets * 100) if total_projets > 0 else 0
        
        stats = {
            'projetsActifs': projets_actifs,
            'totalClients': total_clients,
            'totalProjets': total_projets,
            'projetsTermines': projets_termines,
            'projetsEnCours': projets_actifs,
            'projetsEnPause': projets_en_pause,
            'projetsEnRetard': projets_en_retard,
            'alertes': alertes,
            'tauxCompletion': round(taux_completion, 1),
            'budgetTotal': 150000,  # À adapter selon votre structure
            'revenusTotal': 120000   # À adapter selon votre structure
        }
        
        cursor.close()
        connection.close()
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/dashboard/chart-data', methods=['GET'])
def get_chart_data():
    """Récupère les données pour les graphiques"""
    try:
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # 1. Répartition des projets par statut (Pie Chart)
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN Statut_projet = 'en_cours' THEN 'En cours'
                    WHEN Statut_projet = 'termine' THEN 'Terminés'
                    WHEN Statut_projet = 'en_pause' THEN 'En pause'
                END as statut,
                COUNT(*) as count
            FROM projet 
            GROUP BY Statut_projet
        """)
        statuts_data = cursor.fetchall()
        
        # Ajouter les projets en retard
        cursor.execute("""
            SELECT COUNT(*) as count FROM projet 
            WHERE DateFinPrevue < CURDATE() AND Statut_projet != 'termine'
        """)
        retard_count = cursor.fetchone()['count']
        
        projets_par_statut = {
            'labels': [],
            'data': []
        }
        
        for row in statuts_data:
            projets_par_statut['labels'].append(row['statut'])
            projets_par_statut['data'].append(row['count'])
        
        if retard_count > 0:
            projets_par_statut['labels'].append('En retard')
            projets_par_statut['data'].append(retard_count)
        
        # 2. Évolution des projets sur 12 mois (Line Chart)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(DateCreationProjet, '%Y-%m') as mois,
                COUNT(*) as count
            FROM projet 
            WHERE DateCreationProjet >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(DateCreationProjet, '%Y-%m')
            ORDER BY mois
        """)
        evolution_data = cursor.fetchall()
        
        # Créer tous les mois des 12 derniers mois
        evolution_projets = {
            'labels': [],
            'data': []
        }
        
        current_date = datetime.now().replace(day=1)
        for i in range(12):
            month_date = current_date - timedelta(days=i*30)
            month_key = month_date.strftime('%Y-%m')
            month_label = month_date.strftime('%b %Y')
            
            evolution_projets['labels'].insert(0, month_label)
            
            # Chercher les données pour ce mois
            count = 0
            for row in evolution_data:
                if row['mois'] == month_key:
                    count = row['count']
                    break
            evolution_projets['data'].insert(0, count)
        
        # 3. Performance des équipes (Bar Chart)
        cursor.execute("""
            SELECT 
                e.NomEquipe,
                COUNT(t.IdTache) as taches_terminees,
                (COUNT(CASE WHEN t.Statut = 'terminée' THEN 1 END) / COUNT(t.IdTache) * 100) as taux_reussite
            FROM equipe e
            LEFT JOIN equipe_utilisateur eu ON e.IdEquipe = eu.IdEquipe
            LEFT JOIN taches t ON eu.Id_user = t.Id_user_assigne
            GROUP BY e.IdEquipe, e.NomEquipe
        """)
        equipes_data = cursor.fetchall()
        
        performance_equipes = {
            'labels': [],
            'tachesTerminees': [],
            'tauxReussite': []
        }
        
        for row in equipes_data:
            performance_equipes['labels'].append(row['NomEquipe'] or 'Non assigné')
            performance_equipes['tachesTerminees'].append(row['taches_terminees'] or 0)
            performance_equipes['tauxReussite'].append(round(row['taux_reussite'] or 0, 1))
        
        # 4. Budget vs Dépenses (données simulées - à adapter)
        cursor.execute("SELECT NomProjet FROM projet LIMIT 5")
        projets_budget = cursor.fetchall()
        
        budget_vs_depenses = {
            'labels': [p['NomProjet'] for p in projets_budget],
            'budget': [15000, 25000, 10000, 30000, 20000],  # À adapter
            'depenses': [12000, 22000, 8000, 28000, 18000]   # À adapter
        }
        
        chart_data = {
            'projetsParStatut': projets_par_statut,
            'evolutionProjets': evolution_projets,
            'performanceEquipes': performance_equipes,
            'budgetVsDepenses': budget_vs_depenses
        }
        
        cursor.close()
        connection.close()
        
        return jsonify(chart_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/dashboard/recent-activities', methods=['GET'])
def get_recent_activities():
    """Récupère les activités récentes"""
    try:
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                al.action,
                al.details,
                al.date_action,
                u.Nom_user as utilisateur
            FROM audit_log al
            JOIN utilisateur u ON al.utilisateur_id = u.Id_user
            ORDER BY al.date_action DESC
            LIMIT 10
        """)
        
        activities = cursor.fetchall()
        
        # Convertir les dates en chaînes
        for activity in activities:
            if activity['date_action']:
                activity['date_action'] = activity['date_action'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        connection.close()
        
        return jsonify(activities)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/dashboard/notifications', methods=['GET'])
def get_dashboard_notifications():
    """Récupère les notifications importantes"""
    try:
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                n.Sujet as message,
                DATE_FORMAT(n.Date_envoie, '%Y-%m-%d') as date,
                n.Type,
                u.Nom_user as utilisateur
            FROM notification n
            JOIN utilisateur u ON n.Id_user = u.Id_user
            WHERE n.Lu = 0
            ORDER BY n.Date_envoie DESC
            LIMIT 5
        """)
        
        notifications = cursor.fetchall()
        
        # Ajouter un ID unique pour chaque notification
        for i, notif in enumerate(notifications):
            notif['id'] = str(i + 1)
        
        cursor.close()
        connection.close()
        
        return jsonify(notifications)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/dashboard/kpis', methods=['GET'])
def get_kpis():
    """Récupère les KPIs pour les rapports"""
    try:
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Taux de réussite des projets
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN Statut_projet = 'termine' THEN 1 END) as termines,
                COUNT(*) as total
            FROM projet
        """)
        projets_stats = cursor.fetchone()
        taux_reussite = (projets_stats['termines'] / projets_stats['total'] * 100) if projets_stats['total'] > 0 else 0
        
        # Performance moyenne des équipes
        cursor.execute("""
            SELECT AVG(
                CASE WHEN COUNT(t.IdTache) > 0 
                THEN (COUNT(CASE WHEN t.Statut = 'terminée' THEN 1 END) / COUNT(t.IdTache) * 100)
                ELSE 0 END
            ) as performance_moyenne
            FROM equipe e
            LEFT JOIN equipe_utilisateur eu ON e.IdEquipe = eu.IdEquipe
            LEFT JOIN taches t ON eu.Id_user = t.Id_user_assigne
        """)
        perf_result = cursor.fetchone()
        performance_equipes = round(perf_result['performance_moyenne'] or 0, 1)
        
        # Satisfaction client (simulée - à adapter selon vos données)
        satisfaction_client = 85.5
        
        kpis = [
            {'id': '1', 'titre': 'Taux de réussite projets', 'valeur': f"{round(taux_reussite, 1)}%"},
            {'id': '2', 'titre': 'Performance équipes', 'valeur': f"{performance_equipes}%"},
            {'id': '3', 'titre': 'Satisfaction client', 'valeur': f"{satisfaction_client}%"},
            {'id': '4', 'titre': 'Projets en cours', 'valeur': projets_stats['total'] - projets_stats['termines']},
        ]
        
        cursor.close()
        connection.close()
        
        return jsonify(kpis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/client/dashboard/stats', methods=['GET'])
def get_client_dashboard_stats():
    """Récupère les statistiques du dashboard client"""
    try:
        client_id = request.args.get('client_id')
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Projets actifs du client
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM projet 
            WHERE IdClient = %s AND Statut_projet = 'en_cours'
        """, (client_id,))
        projets_actifs = cursor.fetchone()['count']
        
        # Total projets du client
        cursor.execute("SELECT COUNT(*) as count FROM projet WHERE IdClient = %s", (client_id,))
        total_projets = cursor.fetchone()['count']
        
        # Tâches en cours
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM taches t
            JOIN projet p ON t.ID_projet = p.ID_projet
            WHERE p.IdClient = %s AND t.Statut = 'en_cours'
        """, (client_id,))
        taches_en_cours = cursor.fetchone()['count']
        
        # Documents partagés
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM document d
            JOIN projet p ON d.ID_projet = p.ID_projet
            WHERE p.IdClient = %s
        """, (client_id,))
        documents = cursor.fetchone()['count']
        
        stats = {
            'projetsActifs': projets_actifs,
            'totalProjets': total_projets,
            'tachesEnCours': taches_en_cours,
            'documents': documents
        }
        
        cursor.close()
        connection.close()
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/client/dashboard/chart-data', methods=['GET'])
def get_client_chart_data():
    """Récupère les données des graphiques pour le client"""
    try:
        client_id = request.args.get('client_id')
        connection = create_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Avancement des projets
        cursor.execute("""
            SELECT NomProjet, Avancement
            FROM projet
            WHERE IdClient = %s
            ORDER BY DateCreationProjet DESC
            LIMIT 5
        """, (client_id,))
        avancement_data = cursor.fetchall()
        
        avancement_projets = {
            'labels': [p['NomProjet'] for p in avancement_data],
            'data': [p['Avancement'] for p in avancement_data]
        }
        
        # Distribution des tâches par statut
        cursor.execute("""
            SELECT t.Statut, COUNT(*) as count
            FROM taches t
            JOIN projet p ON t.ID_projet = p.ID_projet
            WHERE p.IdClient = %s
            GROUP BY t.Statut
        """, (client_id,))
        taches_data = cursor.fetchall()
        
        distribution_taches = {
            'labels': [t['Statut'] for t in taches_data],
            'data': [t['count'] for t in taches_data]
        }
        
        chart_data = {
            'avancementProjets': avancement_projets,
            'distributionTaches': distribution_taches
        }
        
        cursor.close()
        connection.close()
        
        return jsonify(chart_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/secretaire/dashboard-stats', methods=['GET'])
def get_secretaire_dashboard_stats():
    """Récupère les statistiques du dashboard secrétaire"""
    try:
        # Vérification du token
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token manquant ou invalide'}), 401

        conn = create_db_connection()
        if not conn:
            return jsonify({'error': 'Erreur de connexion à la base de données'}), 500

        cursor = conn.cursor(dictionary=True)

        # Tâches à planifier
        cursor.execute("""
            SELECT COUNT(*) as count FROM taches 
            WHERE Statut = 'a_planifier'
        """)
        taches = cursor.fetchone()['count']

        # Documents à traiter
        cursor.execute("""
            SELECT COUNT(*) as count FROM document 
            WHERE Statut = 'non_traite'
        """)
        documents = cursor.fetchone()['count']

        # Événements à venir
        cursor.execute("""
            SELECT COUNT(*) as count FROM evenement 
            WHERE DateEvenement > NOW()
        """)
        evenements = cursor.fetchone()['count']

        # Notifications non lues
        cursor.execute("""
            SELECT COUNT(*) as count FROM notification 
            WHERE lu = FALSE
        """)
        notifications = cursor.fetchone()['count']

        cursor.close()
        conn.close()

        return jsonify({
            'tachesAPlanifier': taches,
            'documentsATraiter': documents,
            'evenementsAVenir': evenements,
            'notificationsNonLues': notifications
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500