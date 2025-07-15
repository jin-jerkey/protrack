THEME : CONCEPTION ET DEVELOPPEMENT D’UN PORTAIL CLIENT POUR LE SUIVI DES PROJETS DE DEVELOPPEMENT LOGICIEL.
PRÉSENTATION DU PROJET
Contexte
Dans une entreprise de services numériques, les échanges entre les clients et les développeurs sont souvent dispersés (e-mails, appels, messages WhatsApp), ce qui complique le suivi du projet, la validation des livrables et la gestion des retours. 
La BIGDATA CENTER gère plusieurs projets en parallèle pour divers clients. Dans ce contexte, la mise en place d’un portail client devient un levier stratégique pour améliorer la transparence, la satisfaction client et l’efficacité globale du cycle de développement. Ce projet s’inscrit dans la volonté de digitalisation et de professionnalisation de la relation client chez BIGDATA Center. Actuellement, les échanges se font de manière informelle (WhatsApp, mails), ce qui entraîne des pertes d’informations et des retards dans les livraisons.
 Objectifs
Le portail doit permettre aux clients d’interagir facilement avec l’équipe projet, de suivre l’état d’avancement de chaque tâche et de valider ou commenter les livrables reçus. Il offrira une vision synthétique et claire de l’état global du projet ainsi qu’un historique des échanges. L’objectif est également de réduire les erreurs et oublis dus à une communication dispersée sur différents canaux. Le projet ainsi :
•	Offrira à chaque client une interface personnalisée de suivi.
•	Permettra aux administrateurs de visualiser tous les projets.
•	Centralisera les échanges (messages, livrables) dans une seule plateforme.
•	Automatisera l’affichage des avancements de projets.

PÉRIMÈTRE DU PROJET
	Utilisateurs :
•	 Client : peut consulter uniquement ses projets, livrables, messages.
•	Administrateur : a un accès global à tous les projets, clients, messages.

	Fonctionnalités Client :
•	Authentification sécurisée.
•	 Tableau de bord personnalisé.
•	 Visualisation des projets (progression).
•	 Téléchargement des livrables.
•	 Messagerie projet.
•	 Notifications.

	Fonctionnalités Admin :
•	Gestion globale des clients, projets, livrables.
•	Tableau de bord statistique.
•	 Ajout et modification des projets et utilisateurs.

EXIGENCES FONCTIONNELLES DE L’APPLICATION
Les exigences fonctionnelles définissent les fonctionnalités essentielles que le logiciel doit offrir pour répondre aux besoins de l’entreprise. Voici les principales exigences fonctionnelles du logiciel :
Espace Client :
•	Authentification sécurisée avec identifiants personnels
•	Tableau de bord affichant :
o	Liste de ses projets
o	Avancement (en % ou en étapes)
o	Derniers livrables disponibles
•	Détail d’un projet :
o	Description du projet
o	Échéances
o	Livrables téléchargeables
o	Historique des étapes livrées
o	Statut (En cours / En pause / Terminé)
•	Messagerie ou commentaires par projet
•	Notifications (e-mail ou sur le portail)
Espace Administrateur :
•	Tableau de bord général :
o	Nombre total de clients
o	Nombre de projets (par statut)
o	Alertes ou retards
•	Gestion des clients (ajout, modification, suppression)
•	Gestion des projets (création, affectation à un client, définition des étapes)
•	Téléversement de livrables
•	Consultation de l’historique des échanges
•	Statistiques et rapports de suivi
Fonctions techniques transversales :
•	Authentification avec rôles (Client / Admin)
•	Filtrage automatique des projets affichés selon l'utilisateur connecté
•	Journalisation des actions importantes (ajout de projet, modification, livrables)
•	Interface responsive adaptée aux écrans mobiles et desktop
•	Sauvegarde automatique de la base de données

CONTRAINTES
Les contraintes Non Fonctionnelles
Les contraintes non fonctionnelles concernent les aspects techniques, ergonomiques, de performance et de sécurité qui ne sont pas directement des fonctionnalités, mais qui conditionnent la qualité globale de l’application.
	Sécurité
•	L’application doit utiliser un protocole HTTPS pour protéger les données échangées entre le client et le serveur.
•	Les utilisateurs doivent s’authentifier avec des identifiants uniques (login et mot de passe).
•	Les accès doivent être restreints selon le profil de l’utilisateur (client = accès uniquement à ses projets ; admin = vue globale).
•	Les actions sensibles (modification, suppression) doivent être journalisées (logs d’audit).
	Performance
•	Les temps de réponse du portail doivent être inférieurs à 2 secondes pour chaque action (consultation, téléchargement, mise à jour).
•	L’application doit pouvoir gérer simultanément un minimum de 10 utilisateurs connectés sans dégradation de performance.
	Ergonomie et accessibilité
•	L’interface doit être claire et intuitive, avec un design cohérent et un contraste suffisant (dans ton cas, rouge foncé comme couleur principale de l’entreprise).
•	L’application doit être responsive, c’est-à-dire adaptée aux écrans d’ordinateur, de tablette et de smartphone.
•	Les messages d’erreur doivent être explicites (ex. « Mot de passe incorrect », « Erreur de téléchargement ») pour faciliter la prise en main.
Les contraintes d’exploitation
Les contraintes d’exploitation sont les connaissances et aptitudes nécessaires pour utiliser efficacement le système une fois qu’il est en production. Elles concernent les utilisateurs finaux (clients, administrateurs) et les techniciens
	Formation du personnel :une formation approfondie pour le personnel de BIGDATA CENTER afin de garantir une utilisation efficace de la solution logicielle. Les membres du personnel doivent être formes sur les fonctionnalités de l’outil, les meilleurs pratiques d’utilisation et les processus de planification à suivre.
	Le système doit pouvoir gérer une augmentation de l’ombre d’utilisateur de taches et de projets sans perte de performance significatives.

Contraintes de sécurité
Les contraintes de sécurité sont essentielles pour garantir la confidentialité, l’intégrité et la disponibilité des données manipulées par ton application.
	Gestion des rôles et des permissions
•	Deux profils distincts : Client et Administrateur.
•	Les clients n’ont accès qu’à leurs propres projets et livrables.
•	Les administrateurs ont une vision globale sur tous les projets et clients.
	Confidentialité des données
•	Chiffrement des données échangées entre le client et le serveur via HTTPS.
•	Accès restreint aux données stockées dans la base de données (pas de partage de données entre clients).
	Sécurité physique et environnementale
•	Hébergement sur un serveur fiable, sécurisé physiquement et avec une alimentation de secours.
•	Limiter l’accès physique aux serveurs aux seules personnes autorisées.

CONCEPTION ET ARCHITECTURE
Le processus de réalisation de la solution logicielle doit se faire sur un ordinateur pouvant se connecter à internet et ayant pour caractéristiques :
Technologies Utilisées
•	Développement : Python flask pour le Backend et React +TailwindCSS pour le Frontend
•	Base de données : MYSQL
•	Hébergement : Serveur web compatible Python
•	SEO : Optimisation pour les moteurs de recherche (balises méta, structure des URLs, temps de chargement optimisé).

CONTRAINTES ET EXIGENCES
Contraintes Techniques
•	Application responsive (adapté aux mobiles, tablettes et ordinateurs).
•	Interface utilisateur intuitive et fluide.
•	Chargement rapide des pages.
 Contraintes de Déploiement
•	Hébergement sur un serveur performant.
•	Mise en ligne avec un nom de domaine propre.
•	Certificat SSL pour sécuriser les échanges de données.


