from flask import Blueprint, request, jsonify, make_response
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
                t.IntituleTache as titre,
                t.Description as description,
                t.DateDebutPrevue as dateDebut,
                t.DateFinPrevue as dateFin,
                t.Statut as statut,
                t.Priorite as priorite,
                u.Nom_user as responsable,
                p.NomProjet as projet
            FROM taches t
            JOIN projet p ON t.ID_projet = p.ID_projet
            LEFT JOIN utilisateur u ON t.Id_user_assigne = u.Id_user
            ORDER BY t.DateDebutPrevue ASC
        """)
        taches = cursor.fetchall()
        
        response = make_response(jsonify(taches))
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
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
            UPDATE taches 
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

@planification_bp.route('/api/planification/projets', methods=['GET'])
def get_projets():
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                ID_projet as id,
                NomProjet as nom
            FROM projet
            WHERE Statut_projet = 'en_cours'
        """)
        projets = cursor.fetchall()
        return jsonify(projets)
    finally:
        cursor.close()
        conn.close()

@planification_bp.route('/api/planification/creer-tache', methods=['POST'])
def creer_tache():
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        
        # Créer la tâche
        cursor.execute("""
            INSERT INTO taches (
                IntituleTache, Description, Statut, Priorite, 
                DateDebutPrevue, DateFinPrevue, ID_projet, Id_user_assigne
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['titre'], 
            data['description'], 
            'à_faire',  # Utilisez les valeurs d'énumération correctes de la BD
            data['priorite'],
            data['dateDebut'], 
            data['dateFin'],
            data['projetId'],
            data['responsableIds'][0] if data['responsableIds'] else None  # Assigne au premier responsable
        ))
        conn.commit()
        tache_id = cursor.lastrowid

        # Créer des notifications pour chaque responsable
        for responsable_id in data['responsableIds']:
            cursor.execute("""
                INSERT INTO notification (
                    Type, Sujet, Contenu, Id_user, ID_projet
                ) VALUES ('portal', 'Nouvelle tâche assignée', %s, %s, %s)
            """, (
                f"Vous avez été assigné à la tâche: {data['titre']}", 
                responsable_id,
                data['projetId']
            ))
        
        conn.commit()
        return jsonify({'message': 'Tâche créée avec succès', 'id': tache_id}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()