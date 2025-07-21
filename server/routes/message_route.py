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
        cursor.execute("""
            INSERT INTO message (Contenu, ID_projet, Id_user, Id_destinataire, Type)
            VALUES (%s, %s, %s, %s, 'message')
        """, (data['contenu'], data['projetId'], data['userId'], data['destinataireId']))
        
        conn.commit()
        
        # Créer une notification pour le destinataire
        cursor.execute("""
            INSERT INTO notification (Type, Sujet, Contenu, Id_user, ID_projet)
            VALUES ('portal', 'Nouveau message', %s, %s, %s)
        """, (
            f"Nouveau message de {data.get('userName', 'Utilisateur')}",
            data['destinataireId'],
            data['projetId']
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