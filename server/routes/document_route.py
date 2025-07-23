from flask import Blueprint, request, jsonify, send_file
from db import create_db_connection
import os

document_bp = Blueprint('document', __name__)

@document_bp.route('/api/client/documents/<int:client_id>/<username>', methods=['GET'])
def get_client_documents(client_id, username):
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
                d.Taille as taille,
                p.NomProjet as projet,
                t.IntituleTache as tache,
                u.Nom_user as uploadeur
            FROM document d
            JOIN projet p ON d.ID_projet = p.ID_projet
            LEFT JOIN taches t ON d.IdTache = t.IdTache
            JOIN utilisateur u ON d.Id_user = u.Id_user
            WHERE p.IdClient = %s AND u.Nom_user = %s
            ORDER BY d.DatePartage DESC
        """, (client_id, username))
        documents = cursor.fetchall()
        return jsonify(documents)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@document_bp.route('/api/documents', methods=['GET'])
def get_all_documents():
    """Récupérer tous les documents avec leurs détails"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                d.IdDocument as id,
                d.LibelleDocument as nom,
                d.DatePartage as date,
                d.CheminFichier as chemin,
                d.Type as type,
                d.Taille as taille,
                p.NomProjet as projet,
                t.IntituleTache as tache,
                u_client.Nom_user as client,
                u_upload.Nom_user as uploadeur
            FROM document d
            JOIN projet p ON d.ID_projet = p.ID_projet
            LEFT JOIN taches t ON d.IdTache = t.IdTache
            JOIN utilisateur u_client ON p.IdClient = u_client.Id_user
            JOIN utilisateur u_upload ON d.Id_user = u_upload.Id_user
            ORDER BY d.DatePartage DESC
        """)
        documents = cursor.fetchall()
        return jsonify(documents)
    finally:
        cursor.close()
        conn.close()

@document_bp.route('/api/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    """Télécharger un document"""
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT CheminFichier, LibelleDocument
            FROM document
            WHERE IdDocument = %s
        """, (document_id,))
        document = cursor.fetchone()
        
        if not document:
            return jsonify({'error': 'Document non trouvé'}), 404
            
        return send_file(
            document['CheminFichier'],
            as_attachment=True,
            download_name=document['LibelleDocument']
        )
    finally:
        cursor.close()
        conn.close()