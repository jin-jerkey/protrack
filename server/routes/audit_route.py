from flask import Blueprint, request, jsonify
from db import create_db_connection

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/api/audit/', methods=['GET'])
def get_audit_logs():
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                a.id,
                a.action,
                a.table_affectee,
                a.id_element,
                a.details,
                a.date_action,
                u.Nom_user as utilisateur
            FROM audit_log a
            JOIN utilisateur u ON a.utilisateur_id = u.Id_user
            ORDER BY a.date_action DESC
        """)
        logs = cursor.fetchall()
        return jsonify(logs)
    finally:
        cursor.close()
        conn.close()