from flask import Blueprint, request, jsonify
from db import create_db_connection
from datetime import datetime
from werkzeug.utils import secure_filename
import os

employe_bp = Blueprint('employe', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'zip'}

# Créer le dossier uploads s'il n'existe pas
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        
        # Récupérer l'ancienne tâche pour vérification
        cursor.execute("SELECT Statut FROM taches WHERE IdTache = %s", (id,))
        ancien_statut = cursor.fetchone()[0]
        
        # Mise à jour du statut
        cursor.execute("""
            UPDATE taches 
            SET Statut = %s,
                DateFinReelle = CASE 
                    WHEN %s = 'terminée' THEN CURDATE()
                    WHEN %s = 'en_cours' AND %s = 'terminée' THEN NULL
                    ELSE DateFinReelle 
                END
            WHERE IdTache = %s
        """, (nouveau_statut, nouveau_statut, nouveau_statut, ancien_statut, id))
        
        # Générer les notifications appropriées
        if nouveau_statut == 'terminée':
            # Notification pour tâche terminée
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
        elif nouveau_statut == 'en_cours' and ancien_statut == 'terminée':
            # Notification pour tâche reprise
            cursor.execute("""
                INSERT INTO notification (Type, Sujet, Contenu, Id_user, ID_projet)
                SELECT 
                    'portal',
                    'Tâche reprise',
                    CONCAT('La tâche "', t.IntituleTache, '" a été remise en cours'),
                    p.IdClient,
                    t.ID_projet
                FROM taches t
                JOIN projet p ON t.ID_projet = p.ID_projet
                WHERE t.IdTache = %s
            """, (id,))

        conn.commit()
        return jsonify({
            'message': 'Statut mis à jour avec succès',
            'nouveau_statut': nouveau_statut
        })

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

@employe_bp.route('/api/employe/tache/<int:tache_id>/document', methods=['POST'])
def upload_document(tache_id):
    """Upload un document pour une tâche"""
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier envoyé'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Type de fichier non autorisé'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        # Sécuriser le nom du fichier
        filename = secure_filename(file.filename)
        # Ajouter un timestamp pour éviter les doublons
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = timestamp + filename
        
        # Chemin complet du fichier
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Sauvegarder le fichier
        file.save(filepath)
        
        cursor = conn.cursor()
        
        # Récupérer l'ID du projet associé à la tâche
        cursor.execute("SELECT ID_projet FROM taches WHERE IdTache = %s", (tache_id,))
        projet_id = cursor.fetchone()[0]
        
        # Insérer le document dans la base de données
        cursor.execute("""
            INSERT INTO document (
                LibelleDocument, 
                CheminFichier, 
                Taille, 
                Type, 
                ID_projet, 
                IdTache, 
                Id_user
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            filename,
            filepath,
            os.path.getsize(filepath),
            file.filename.rsplit('.', 1)[1].lower(),
            projet_id,
            tache_id,
            request.args.get('userId')
        ))
        
        # Ajouter une notification pour informer du document uploadé
        cursor.execute("""
            INSERT INTO notification (Type, Sujet, Contenu, Id_user, ID_projet)
            SELECT 
                'portal',
                'Document ajouté',
                CONCAT('Un document "', %s, '" a été ajouté à la tâche "', t.IntituleTache, '"'),
                p.IdClient,
                t.ID_projet
            FROM taches t
            JOIN projet p ON t.ID_projet = p.ID_projet
            WHERE t.IdTache = %s
        """, (file.filename, tache_id))
        
        conn.commit()
        
        return jsonify({
            'message': 'Document uploadé avec succès',
            'filename': filename
        })

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()