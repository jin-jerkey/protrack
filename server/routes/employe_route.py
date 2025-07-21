from flask import Blueprint, request, jsonify
from db import create_db_connection
from datetime import datetime

employe_bp = Blueprint('employe', __name__)

@employe_bp.route('/api/employe/taches', methods=['GET'])
def get_employe_taches():
    """Récupérer les tâches assignées à l'employé connecté"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        # Récupérer l'ID de l'employé depuis les paramètres de requête
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'ID utilisateur non fourni'}), 400

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                t.IdTache as id,
                t.IntituleTache as titre,
                t.Description as description,
                t.DateDebutPrevue as dateDebut,
                t.DateFinPrevue as dateFin,
                t.DateFinReelle as dateFinReelle,
                t.Statut as statut,
                t.Priorite as priorite,
                p.NomProjet as projet,
                u.Nom_user as responsable
            FROM taches t
            LEFT JOIN projet p ON t.ID_projet = p.ID_projet
            LEFT JOIN utilisateur u ON t.Id_user_assigne = u.Id_user
            WHERE t.Id_user_assigne = %s
            ORDER BY 
                CASE t.Priorite
                    WHEN 'critique' THEN 1
                    WHEN 'haute' THEN 2
                    WHEN 'moyenne' THEN 3
                    WHEN 'faible' THEN 4
                END,
                t.DateFinPrevue ASC
        """, (user_id,))
        
        taches = cursor.fetchall()
        
        # Formater les dates pour le frontend
        for tache in taches:
            if tache['dateDebut']:
                tache['dateDebut'] = tache['dateDebut'].strftime('%Y-%m-%d')
            if tache['dateFin']:
                tache['dateFin'] = tache['dateFin'].strftime('%Y-%m-%d')
            if tache['dateFinReelle']:
                tache['dateFinReelle'] = tache['dateFinReelle'].strftime('%Y-%m-%d')

        return jsonify(taches)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employe_bp.route('/api/employe/tache/<int:id>/statut', methods=['PUT'])
def update_tache_statut(id):
    """Mettre à jour le statut d'une tâche"""
    data = request.get_json()
    nouveau_statut = data.get('statut')
    
    if not nouveau_statut:
        return jsonify({'error': 'Le statut est requis'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        cursor = conn.cursor()
        
        # Mise à jour du statut
        cursor.execute("""
            UPDATE taches 
            SET Statut = %s,
                DateFinReelle = CASE 
                    WHEN %s = 'terminée' THEN CURDATE()
                    ELSE NULL 
                END
            WHERE IdTache = %s
        """, (nouveau_statut, nouveau_statut, id))
        
        # Si la tâche est terminée, on ajoute la date de fin réelle
        if nouveau_statut == 'terminée':
            cursor.execute("""
                INSERT INTO notification (Type, Sujet, Contenu, Id_user, ID_projet)
                SELECT 
                    'portal',
                    'Tâche terminée',
                    CONCAT('La tâche "', t.IntituleTache, '" a été marquée comme terminée'),
                    p.IdClient,
                    t.ID_projet
                FROM taches t
                JOIN projet p ON t.ID_projet = p.ID_projet
                WHERE t.IdTache = %s
            """, (id,))

        conn.commit()
        return jsonify({'message': 'Statut mis à jour avec succès'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employe_bp.route('/api/employe/taches/stats', methods=['GET'])
def get_taches_stats():
    """Récupérer les statistiques des tâches de l'employé"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        user_id = request.headers.get('user_id')
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Statut = 'à_faire' THEN 1 ELSE 0 END) as aFaire,
                SUM(CASE WHEN Statut = 'en_cours' THEN 1 ELSE 0 END) as enCours,
                SUM(CASE WHEN Statut = 'terminée' THEN 1 ELSE 0 END) as terminees,
                SUM(CASE WHEN Statut = 'bloquée' THEN 1 ELSE 0 END) as bloquees
            FROM taches
            WHERE Id_user_assigne = %s
        """, (user_id,))
        
        stats = cursor.fetchone()
        return jsonify(stats)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employe_bp.route('/api/employe/profile/<int:id>', methods=['GET'])
def get_profile(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                Id_user as id,
                Nom_user as nom,
                Email as email,
                phone_user as telephone,
                Role as role,
                Date_creation as date_creation
            FROM utilisateur
            WHERE Id_user = %s
        """, (id,))
        
        user = cursor.fetchone()
        if user:
            user['date_creation'] = user['date_creation'].isoformat()
            return jsonify(user)
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employe_bp.route('/api/employe/profile/<int:id>', methods=['PUT'])
def update_profile(id):
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE utilisateur
            SET Nom_user = %s, phone_user = %s
            WHERE Id_user = %s
        """, (data['nom'], data['telephone'], id))
        
        conn.commit()
        return jsonify({'message': 'Profil mis à jour avec succès'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employe_bp.route('/api/employe/taches/all', methods=['GET'])
def get_all_taches():
    """Récupérer toutes les tâches pour l'admin"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                t.IdTache as id,
                t.IntituleTache as titre,
                t.Description as description,
                t.DateDebutPrevue as dateDebut,
                t.DateFinPrevue as dateFin,
                t.DateFinReelle as dateFinReelle,
                t.Statut as statut,
                t.Priorite as priorite,
                p.NomProjet as projet,
                u.Nom_user as responsable
            FROM taches t
            LEFT JOIN projet p ON t.ID_projet = p.ID_projet
            LEFT JOIN utilisateur u ON t.Id_user_assigne = u.Id_user
            ORDER BY t.DateDebutPrevue DESC
        """)
        
        taches = cursor.fetchall()
        
        # Formater les dates pour le frontend
        for tache in taches:
            if tache['dateDebut']:
                tache['dateDebut'] = tache['dateDebut'].strftime('%Y-%m-%d')
            if tache['dateFin']:
                tache['dateFin'] = tache['dateFin'].strftime('%Y-%m-%d')
            if tache['dateFinReelle']:
                tache['dateFinReelle'] = tache['dateFinReelle'].strftime('%Y-%m-%d')

        return jsonify(taches)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()