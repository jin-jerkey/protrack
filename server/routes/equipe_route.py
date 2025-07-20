from flask import Blueprint, request, jsonify
from db import create_db_connection

equipe_bp = Blueprint('equipe', __name__)

@equipe_bp.route('/api/equipe/', methods=['GET'])
def get_equipes():
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.IdEquipe as id,
                e.NomEquipe as nom,
                e.Description as description,
                COUNT(eu.Id_user) as nombreMembres
            FROM equipe e
            LEFT JOIN equipe_utilisateur eu ON e.IdEquipe = eu.IdEquipe
            GROUP BY e.IdEquipe
        """)
        equipes = cursor.fetchall()
        return jsonify(equipes)
    finally:
        cursor.close()
        conn.close()

@equipe_bp.route('/api/equipe/', methods=['POST'])
def add_equipe():
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({"error": "Erreur de connexion"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO equipe (NomEquipe, Description) VALUES (%s, %s)",
            (data['nom'], data.get('description'))
        )
        conn.commit()
        return jsonify({"message": "Équipe créée", "id": cursor.lastrowid})
    finally:
        cursor.close()
        conn.close()

@equipe_bp.route('/api/equipe/<int:id>/membres', methods=['POST'])
def add_membre_equipe(id):
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({"error": "Erreur de connexion"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO equipe_utilisateur (IdEquipe, Id_user) VALUES (%s, %s)",
            (id, data['userId'])
        )
        conn.commit()
        return jsonify({"message": "Membre ajouté"})
    finally:
        cursor.close()
        conn.close()