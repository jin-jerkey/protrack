import mysql.connector
from mysql.connector import Error

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'protrack'
}

def create_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        print("Connexion à MySQL réussie")
        return connection
    except Error as e:
        print(f"Erreur lors de la connexion à MySQL: {e}")
        return None