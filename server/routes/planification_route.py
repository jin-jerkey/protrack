from flask import Blueprint, request, jsonify
from db import create_db_connection
from datetime import datetime

planification_bp = Blueprint('planification', __name__)

@planification_bp.route('/api/planification/taches', methods=['GET'])
def get_taches_planifiees():
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                t.IdTache as id,
                t.TitreTache as titre,
                t.Description as description,
                t.DateDebut as dateDebut,
                t.DateFin as dateFin,
                t.Statut as statut,
                t.Priorite as priorite,
                u.Nom_user as responsable,
                p.NomProjet as projet
            FROM tache t
            JOIN projet p ON t.ID_projet = p.ID_projet
            LEFT JOIN utilisateur u ON t.Id_user = u.Id_user
            ORDER BY t.DateDebut ASC
        """)
        taches = cursor.fetchall()
        return jsonify(taches)
    finally:
        cursor.close()
        conn.close()

@planification_bp.route('/api/planification/assigner', methods=['POST'])
def assigner_tache():
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tache 
            SET Id_user = %s, DateDebut = %s, DateFin = %s, Statut = 'assignee'
            WHERE IdTache = %s
        """, (data['responsableId'], data['dateDebut'], data['dateFin'], data['tacheId']))
        conn.commit()

        # Créer une notification pour le responsable
        cursor.execute("""
            INSERT INTO notification (Type, Sujet, Contenu, Id_user)
            VALUES ('assignment', 'Nouvelle tâche assignée', %s, %s)
        """, (f"Vous avez été assigné à la tâche: {data['titre']}", data['responsableId']))
        conn.commit()

        return jsonify({'message': 'Tâche assignée avec succès'})
    finally:
        cursor.close()
        conn.close()