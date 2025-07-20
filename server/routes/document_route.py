from flask import Blueprint, request, jsonify
from db import create_db_connection

document_bp = Blueprint('document', __name__)

@document_bp.route('/api/client/documents/<int:client_id>', methods=['GET'])
def get_client_documents(client_id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                d.IdDocument as id,
                d.LibelleDocument as titre,
                d.DatePartage as date,
                d.CheminFichier as chemin,
                d.Type as type,
                p.NomProjet as projet,
                p.ID_projet as projetId
            FROM document d
            JOIN projet p ON d.ID_projet = p.ID_projet
            WHERE p.IdClient = %s
            ORDER BY d.DatePartage DESC
        """, (client_id,))
        documents = cursor.fetchall()
        return jsonify(documents)
    finally:
        cursor.close()
        conn.close()