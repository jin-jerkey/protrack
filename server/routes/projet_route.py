from flask import Blueprint, request, jsonify
from db import create_db_connection

projet_bp = Blueprint('projet', __name__)

# Afficher tous les projets
@projet_bp.route('/api/projet/', methods=['GET'])
def get_projets():
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                p.ID_projet as id, 
                p.NomProjet as nom, 
                p.Description as description, 
                p.Statut_projet as statut, 
                p.DateDebut as dateDebut, 
                p.DateFinPrevue as dateFinPrevue, 
                u.Nom_user as client,
                COUNT(t.IdTache) as nbTaches,
                SUM(CASE WHEN t.Statut = 'terminée' THEN 1 ELSE 0 END) as nbTachesTerminees,
                CASE 
                    WHEN COUNT(t.IdTache) > 0 THEN 
                        ROUND((SUM(CASE WHEN t.Statut = 'terminée' THEN 1 ELSE 0 END) * 100.0) / COUNT(t.IdTache))
                    ELSE 0
                END as avancement
            FROM projet p
            JOIN utilisateur u ON p.IdClient = u.Id_user
            LEFT JOIN taches t ON t.ID_projet = p.ID_projet
            GROUP BY p.ID_projet, p.NomProjet, p.Description, p.Statut_projet, 
                     p.DateDebut, p.DateFinPrevue, u.Nom_user
        """)
        projets = cursor.fetchall()
        return jsonify(projets)
    finally:
        cursor.close()
        conn.close()

# Ajouter un projet
@projet_bp.route('/api/projet/', methods=['POST'])
def add_projet():
    data = request.get_json()
    nom = data.get('nom')
    description = data.get('description')
    statut = data.get('statut', 'en_cours')
    avancement = data.get('avancement', 0)
    dateDebut = data.get('dateDebut')
    dateFinPrevue = data.get('dateFinPrevue')
    client = data.get('client')

    if not (nom and client):
        return jsonify({'error': 'Champs requis manquants'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        # Trouver l'id du client (si on reçoit le nom, sinon adapter)
        cursor.execute("SELECT Id_user FROM utilisateur WHERE Nom_user=%s OR Id_user=%s", (client, client))
        client_row = cursor.fetchone()
        if not client_row:
            return jsonify({'error': 'Client introuvable'}), 400
        id_client = client_row[0]
        cursor.execute(
            "INSERT INTO projet (NomProjet, Description, Statut_projet, Avancement, DateDebut, DateFinPrevue, IdClient) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (nom, description, statut, avancement, dateDebut, dateFinPrevue, id_client)
        )
        conn.commit()
        return jsonify({'message': 'Projet créé'}), 201
    finally:
        cursor.close()
        conn.close()

# Modifier un projet
@projet_bp.route('/api/projet/<int:id>', methods=['PUT'])
def update_projet(id):
    data = request.get_json()
    nom = data.get('nom')
    description = data.get('description')
    statut = data.get('statut')
    avancement = data.get('avancement')
    dateDebut = data.get('dateDebut')
    dateFinPrevue = data.get('dateFinPrevue')
    client = data.get('client')

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT Id_user FROM utilisateur WHERE Nom_user=%s OR Id_user=%s", (client, client))
        client_row = cursor.fetchone()
        if not client_row:
            return jsonify({'error': 'Client introuvable'}), 400
        id_client = client_row[0]
        cursor.execute(
            "UPDATE projet SET NomProjet=%s, Description=%s, Statut_projet=%s, Avancement=%s, DateDebut=%s, DateFinPrevue=%s, IdClient=%s WHERE ID_projet=%s",
            (nom, description, statut, avancement, dateDebut, dateFinPrevue, id_client, id)
        )
        conn.commit()
        return jsonify({'message': 'Projet modifié'})
    finally:
        cursor.close()
        conn.close()

# Supprimer un projet
@projet_bp.route('/api/projet/<int:id>', methods=['DELETE'])
def delete_projet(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projet WHERE ID_projet=%s", (id,))
        conn.commit()
        return jsonify({'message': 'Projet supprimé'})
    finally:
        cursor.close()
        conn.close()

# Récupérer les détails d'un projet avec ses statistiques
@projet_bp.route('/api/projet/<int:id>', methods=['GET'])
def get_projet_details(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                p.ID_projet as id,
                p.NomProjet as nom,
                p.Description as description,
                p.Statut_projet as statut,
                p.DateDebut as dateDebut,
                p.DateFinPrevue as dateFinPrevue,
                u.Nom_user as client,
                COUNT(t.IdTache) as nbTaches,
                SUM(CASE WHEN t.Statut = 'terminée' THEN 1 ELSE 0 END) as nbTachesTerminees,
                CASE 
                    WHEN COUNT(t.IdTache) > 0 THEN 
                        ROUND((SUM(CASE WHEN t.Statut = 'terminée' THEN 1 ELSE 0 END) * 100.0) / COUNT(t.IdTache))
                    ELSE 0
                END as avancement
            FROM projet p
            JOIN utilisateur u ON p.IdClient = u.Id_user
            LEFT JOIN taches t ON t.ID_projet = p.ID_projet
            WHERE p.ID_projet = %s
            GROUP BY p.ID_projet, p.NomProjet, p.Description, p.Statut_projet, 
                     p.DateDebut, p.DateFinPrevue, u.Nom_user
        """, (id,))
        
        projet = cursor.fetchone()
        if not projet:
            return jsonify({'error': 'Projet non trouvé'}), 404
        return jsonify(projet)
    finally:
        cursor.close()
        conn.close()

# Récupérer toutes les tâches d'un projet
@projet_bp.route('/api/projet/<int:id>/taches', methods=['GET'])
def get_projet_taches(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                IdTache as id,
                IntituleTache as titre,
                Description as description,
                DateCreationTache as dateCreation,
                DateDebutPrevue as dateDebut,
                DateFinPrevue as dateFin,
                DateFinReelle as dateFinReelle,
                Statut as statut
            FROM taches
            WHERE ID_projet = %s
            ORDER BY DateCreationTache DESC
        """, (id,))
        taches = cursor.fetchall()
        return jsonify(taches)
    finally:
        cursor.close()
        conn.close()

# Ajouter une nouvelle tâche à un projet
@projet_bp.route('/api/projet/<int:id>/tache', methods=['POST'])
def add_tache(id):
    data = request.get_json()
    titre = data.get('titre')
    description = data.get('description')
    statut = data.get('statut', 'à_faire')
    dateDebut = data.get('dateDebut')
    dateFin = data.get('dateFin')
    priorite = data.get('priorite', 'moyenne')
    id_user_assigne = data.get('id_user_assigne')  # Ajout du champ id_user_assigne

    if not titre:
        return jsonify({'error': 'Le titre est requis'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO taches 
            (IntituleTache, Description, DateDebutPrevue, DateFinPrevue, 
             Statut, Priorite, ID_projet, Id_user_assigne)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (titre, description, dateDebut, dateFin, statut, 
              priorite, id, id_user_assigne))
        
        tache_id = cursor.lastrowid
        
        # Créer une notification pour l'utilisateur assigné
        if id_user_assigne:
            cursor.execute("""
                INSERT INTO notification 
                (Type, Sujet, Contenu, Id_user, ID_projet)
                VALUES ('portal', 'Nouvelle tâche assignée', %s, %s, %s)
            """, (
                f"Vous avez été assigné à la tâche: {titre}",
                id_user_assigne,
                id
            ))
        
        conn.commit()
        return jsonify({
            'message': 'Tâche créée',
            'id': tache_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Modifier une tâche
@projet_bp.route('/api/tache/<int:id>', methods=['PUT'])
def update_tache(id):
    data = request.get_json()
    titre = data.get('titre')
    description = data.get('description')
    statut = data.get('statut')
    dateDebut = data.get('dateDebut')
    dateFin = data.get('dateFin')
    dateFinReelle = data.get('dateFinReelle')

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE taches 
            SET IntituleTache = %s, 
                Description = %s, 
                Statut = %s,
                DateDebutPrevue = %s, 
                DateFinPrevue = %s,
                DateFinReelle = %s
            WHERE IdTache = %s
        """, (titre, description, statut, dateDebut, dateFin, dateFinReelle, id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Tâche non trouvée'}), 404
        return jsonify({'message': 'Tâche modifiée'})
    finally:
        cursor.close()
        conn.close()

# Dans projet_route.py
@projet_bp.route('/api/projet/client/<int:client_id>', methods=['GET'])
def get_projets_client(client_id):
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                p.ID_projet as id, 
                p.NomProjet as nom, 
                p.Description as description, 
                p.Statut_projet as statut, 
                p.DateDebut as dateDebut, 
                p.DateFinPrevue as dateFinPrevue, 
                u.Nom_user as client
            FROM projet p
            JOIN utilisateur u ON p.IdClient = u.Id_user
            WHERE p.IdClient = %s
        """, (client_id,))
        projets = cursor.fetchall()
        return jsonify(projets)
    finally:
        cursor.close()
        conn.close()

# Supprimer une tâche
@projet_bp.route('/api/tache/<int:id>', methods=['DELETE'])
def delete_tache(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM taches WHERE IdTache = %s", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Tâche non trouvée'}), 404
        return jsonify({'message': 'Tâche supprimée'})
    finally:
        cursor.close()
        conn.close()

# Proposer un nouveau projet
@projet_bp.route('/api/projet/proposition', methods=['POST'])
def proposer_projet():
    data = request.get_json()
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projet 
            (NomProjet, Description, IdClient, Statut_projet, DateDebut, DateFinPrevue)
            VALUES (%s, %s, %s, 'proposition', %s, %s)
        """, (data['nom'], data['description'], data['clientId'], 
              data['dateDebut'], data['dateFinPrevue']))
        conn.commit()
        
        # Créer une notification pour les admins
        cursor.execute("""
            INSERT INTO notification (Type, Sujet, Contenu, Id_user)
            SELECT 'portal', 'Nouvelle proposition de projet', 
                   %s, Id_user
            FROM utilisateur 
            WHERE Role = 'admin'
        """, (f"Nouveau projet proposé par {data['clientNom']}",))
        conn.commit()
        
        return jsonify({'message': 'Proposition envoyée avec succès'}), 201
    finally:
        cursor.close()
        conn.close()