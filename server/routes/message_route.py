from flask import Blueprint, request, jsonify
from db import create_db_connection
from datetime import datetime

message_bp = Blueprint('message', __name__)

@message_bp.route('/api/messages', methods=['GET'])
def get_messages():
    """Récupérer tous les messages d'un utilisateur"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        user_id = request.args.get('userId')
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                m.IdMessage as id,
                m.Contenu as message,
                m.DateMessage as date,
                m.Type as type,
                m.ID_projet as projetId,
                p.NomProjet as projetNom,
                u.Id_user as envoyeurId,
                u.Nom_user as envoyeurNom,
                u.Email as envoyeurEmail,
                ud.Id_user as destinataireId,
                ud.Nom_user as destinataireNom
            FROM message m
            JOIN projet p ON m.ID_projet = p.ID_projet
            JOIN utilisateur u ON m.Id_user = u.Id_user
            LEFT JOIN utilisateur ud ON m.Id_destinataire = ud.Id_user
            WHERE m.Id_user = %s OR m.Id_destinataire = %s
            ORDER BY m.DateMessage DESC
        """, (user_id, user_id))
        
        messages = cursor.fetchall()
        
        # Formater les dates
        for msg in messages:
            if msg['date']:
                msg['date'] = msg['date'].strftime('%Y-%m-%d %H:%M:%S')
                
        return jsonify(messages)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@message_bp.route('/api/messages', methods=['POST'])
def create_message():
    """Créer un nouveau message"""
    data = request.get_json()
    
    if not all(key in data for key in ['contenu', 'projetId', 'userId', 'destinataireId']):
        return jsonify({'error': 'Données manquantes'}), 400
        
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        cursor = conn.cursor()
        
        # Insérer le message
        cursor.execute("""
            INSERT INTO message (Contenu, ID_projet, Id_user, Id_destinataire, Type)
            VALUES (%s, %s, %s, %s, 'message')
        """, (data['contenu'], data['projetId'], data['userId'], data['destinataireId']))
        
        # Créer une notification pour le destinataire avec des informations plus détaillées
        cursor.execute("""
            INSERT INTO notification (Type, Sujet, Contenu, Id_user, ID_projet)
            SELECT 
                'portal',
                'Nouveau message',
                CONCAT('Nouveau message de ', u.Nom_user, ' dans le projet "', p.NomProjet, '": ', 
                       CASE 
                           WHEN LENGTH(%s) > 50 THEN CONCAT(LEFT(%s, 50), '...')
                           ELSE %s
                       END),
                %s,
                %s
            FROM utilisateur u, projet p
            WHERE u.Id_user = %s AND p.ID_projet = %s
        """, (
            data['contenu'], data['contenu'], data['contenu'],  # Pour le contenu tronqué
            data['destinataireId'],  # Destinataire de la notification
            data['projetId'],        # Projet associé
            data['userId'],          # Expéditeur pour récupérer son nom
            data['projetId']         # Projet pour récupérer son nom
        ))
        
        conn.commit()
        return jsonify({'message': 'Message envoyé avec succès'}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@message_bp.route('/api/messages/projets', methods=['GET'])
def get_user_projets():
    """Récupérer les projets accessibles pour l'utilisateur"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        user_id = request.args.get('userId')
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT DISTINCT 
                p.ID_projet as id,
                p.NomProjet as nom
            FROM projet p
            LEFT JOIN taches t ON p.ID_projet = t.ID_projet
            WHERE p.IdClient = %s
            OR t.Id_user_assigne = %s
            ORDER BY p.NomProjet
        """, (user_id, user_id))
        
        projets = cursor.fetchall()
        return jsonify(projets)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@message_bp.route('/api/messages/users', methods=['GET'])
def get_project_users():
    """Récupérer les utilisateurs d'un projet"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        project_id = request.args.get('projectId')
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT DISTINCT 
                u.Id_user as id,
                u.Nom_user as nom,
                u.Email as email
            FROM utilisateur u
            LEFT JOIN taches t ON u.Id_user = t.Id_user_assigne
            WHERE t.ID_projet = %s
            UNION
            SELECT 
                u.Id_user as id,
                u.Nom_user as nom,
                u.Email as email
            FROM utilisateur u
            JOIN projet p ON u.Id_user = p.IdClient
            WHERE p.ID_projet = %s
        """, (project_id, project_id))
        
        users = cursor.fetchall()
        return jsonify(users)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@message_bp.route('/api/messages/authorized-users', methods=['GET'])
def get_authorized_users():
    """Récupérer les utilisateurs autorisés selon le rôle"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        user_id = request.args.get('userId')
        role = request.args.get('role')
        
        query = """
            SELECT 
                Id_user as id,
                Nom_user as nom,
                Email as email,
                Role as role
            FROM utilisateur
            WHERE Id_user != %s 
            AND Role IN ('admin', 'secretaire', 'employe')
            ORDER BY Role, Nom_user
        """
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, (user_id,))
        users = cursor.fetchall()
        return jsonify(users)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@message_bp.route('/api/messages/secretaire', methods=['GET'])
def get_secretaire_messages():
    """Récupérer tous les messages pour la secrétaire"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500

    try:
        user_id = request.args.get('userId')
        cursor = conn.cursor(dictionary=True)
        
        # Pour la secrétaire, on récupère tous les messages des projets
        cursor.execute("""
            SELECT 
                m.IdMessage as id,
                m.Contenu as message,
                m.DateMessage as date,
                m.Type as type,
                m.ID_projet as projetId,
                p.NomProjet as projetNom,
                u.Id_user as envoyeurId,
                u.Nom_user as envoyeurNom,
                u.Email as envoyeurEmail,
                ud.Id_user as destinataireId,
                ud.Nom_user as destinataireNom
            FROM message m
            JOIN projet p ON m.ID_projet = p.ID_projet
            JOIN utilisateur u ON m.Id_user = u.Id_user
            LEFT JOIN utilisateur ud ON m.Id_destinataire = ud.Id_user
            ORDER BY m.DateMessage DESC
        """)
        
        messages = cursor.fetchall()
        
        for msg in messages:
            if msg['date']:
                msg['date'] = msg['date'].strftime('%Y-%m-%d %H:%M:%S')
                
        return jsonify(messages)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()