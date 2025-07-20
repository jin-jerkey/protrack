from flask import Blueprint, request, jsonify
from db import create_db_connection

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/api/notification/', methods=['GET'])
def get_notifications():
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                n.IDNotif as id,
                n.Type as type,
                n.Sujet as sujet,
                n.Contenu as contenu,
                n.Lu as lu,
                n.Date_envoie as date,
                u.Nom_user as destinataire,
                p.NomProjet as projet
            FROM notification n
            JOIN utilisateur u ON n.Id_user = u.Id_user
            LEFT JOIN projet p ON n.ID_projet = p.ID_projet
            ORDER BY n.Date_envoie DESC
        """)
        notifications = cursor.fetchall()
        return jsonify(notifications)
    finally:
        cursor.close()
        conn.close()

@notification_bp.route('/api/notification/', methods=['POST'])
def create_notification():
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({"error": "Erreur de connexion"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO notification 
               (Type, Sujet, Contenu, Id_user, ID_projet) 
               VALUES (%s, %s, %s, %s, %s)""",
            (data['type'], data['sujet'], data['contenu'], 
             data['userId'], data.get('projetId'))
        )
        conn.commit()
        return jsonify({"message": "Notification créée"})
    finally:
        cursor.close()
        conn.close()