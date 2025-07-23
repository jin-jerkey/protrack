-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2025 at 10:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `samlearn`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `nom`, `email`, `password_hash`, `created_at`, `last_login`) VALUES
(1, 'Admine', 'admin@samlearn.com', 'pbkdf2:sha256:1000000$pIJI7jQnMum6RV1g$50c224f44a605bb95bb5d094c3bc7e0b28dc4f43bc0f51d3b6f1f5cb995de6a6', '2025-05-23 10:27:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_conversations`
--

CREATE TABLE `chatbot_conversations` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `reponse` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `commentaires`
--

CREATE TABLE `commentaires` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `note` int(11) DEFAULT NULL CHECK (`note` >= 1 and `note` <= 5),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commentaires`
--

INSERT INTO `commentaires` (`id`, `eleve_id`, `cours_id`, `contenu`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'j\'ai aimer ce cour vraiment', 5, '2025-04-17 10:51:57', '2025-04-17 10:51:57'),
(2, 1, 3, 'hgfghgfgfgf', 5, '2025-04-17 18:50:07', '2025-04-17 18:50:07');

-- --------------------------------------------------------

--
-- Table structure for table `cours`
--

CREATE TABLE `cours` (
  `id` int(11) NOT NULL,
  `formateur_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `difficulty_level` enum('débutant','intermédiaire','avancé') DEFAULT NULL,
  `langue` varchar(20) DEFAULT 'Français',
  `duree_estimee` int(11) DEFAULT NULL,
  `prerequis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prerequis`)),
  `mots_cles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mots_cles`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cours`
--

INSERT INTO `cours` (`id`, `formateur_id`, `titre`, `description`, `category`, `difficulty_level`, `langue`, `duree_estimee`, `prerequis`, `mots_cles`, `created_at`) VALUES
(1, 1, 'la physique avec papa wemba', 'apprendre les bien fait de la physique ', 'Physique', '', 'Français', 2, '[\"base de physique\"]', '[\"physique\"]', '2025-03-21 14:38:17'),
(2, 1, 'limite d\'une fonction', 'Apprendre facilement les limites ', 'Mathématiques', '', 'Français', 2, '[\"g\\u00e9ometrie\"]', '[\"mathematique\"]', '2025-03-21 15:47:55'),
(3, 1, 'equation du segond degré facile avec mama sam', 'Apprendre à faire des équations comme un enfant du CM2', 'Mathématiques', '', 'Français', 320, '[\"alg\\u00e9bre\"]', '[\"mathematique\"]', '2025-03-24 10:20:05');

-- --------------------------------------------------------

--
-- Table structure for table `eleve`
--

CREATE TABLE `eleve` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `niveau` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve`
--

INSERT INTO `eleve` (`id`, `nom`, `prenom`, `email`, `password_hash`, `created_at`, `last_login`, `is_active`, `niveau`) VALUES
(1, 'Jerkey', 'Steve', 'stevejerkey@gmail.com', 'scrypt:32768:8:1$1NZniHedpDYWYOqo$4b7f36526cee42c175e64d9e1a7e599138f6246e7dd9393eee1b1540321638211a4519cedf90238ff13f982501e049e94c3110ec76d2ec0c58237553dbc677e8', '2025-03-19 16:56:05', '2025-05-31 12:19:37', 1, '1ereC'),
(8, 'abou', 'nadal', 'abou@gmail.com', 'scrypt:32768:8:1$ObzZE3MqFRKhC86x$7cd6e822beee988c34bcf77cb653ef4b739770ea2dac2bfdaca98c0393265908f35310e89c1a0b3d806641fdf8b3039eee66ea261e7705e460a9ebb63f16fb30', '2025-04-01 11:43:20', '2025-04-07 16:08:39', 1, '1ereD');

-- --------------------------------------------------------

--
-- Table structure for table `eleve_cours`
--

CREATE TABLE `eleve_cours` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `est_termine` tinyint(1) DEFAULT 0,
  `pourcentage_progression` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_cours`
--

INSERT INTO `eleve_cours` (`id`, `eleve_id`, `cours_id`, `date_inscription`, `est_termine`, `pourcentage_progression`) VALUES
(1, 1, 1, '2025-03-25 14:09:57', 0, 0),
(3, 1, 3, '2025-04-01 11:31:14', 1, 0),
(4, 1, 2, '2025-04-01 11:40:43', 0, 0),
(6, 8, 3, '2025-04-01 11:45:50', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `eleve_examen_resultats`
--

CREATE TABLE `eleve_examen_resultats` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL,
  `date_passage` datetime DEFAULT current_timestamp(),
  `score` float NOT NULL,
  `est_reussi` tinyint(1) DEFAULT 0,
  `tentative` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_examen_resultats`
--

INSERT INTO `eleve_examen_resultats` (`id`, `eleve_id`, `examen_id`, `date_passage`, `score`, `est_reussi`, `tentative`) VALUES
(2, 1, 1, '2025-04-08 11:41:46', 0, 0, 1),
(3, 1, 1, '2025-04-08 13:28:10', 100, 1, 1),
(6, 1, 1, '2025-05-10 14:59:02', 100, 1, 1),
(7, 1, 1, '2025-05-26 16:27:26', 100, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `eleve_module_progression`
--

CREATE TABLE `eleve_module_progression` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_completion` datetime DEFAULT NULL,
  `est_complete` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_module_progression`
--

INSERT INTO `eleve_module_progression` (`id`, `eleve_id`, `module_id`, `date_debut`, `date_completion`, `est_complete`) VALUES
(2, 1, 1, '2025-04-08 11:06:14', '2025-05-26 16:27:33', 1),
(3, 1, 2, '2025-04-08 11:06:21', '2025-05-26 16:27:36', 1),
(4, 1, 10, '2025-05-24 11:10:17', '2025-05-26 16:26:42', 1),
(5, 1, 11, '2025-05-24 11:10:19', '2025-05-26 16:26:44', 1),
(6, 1, 18, '2025-05-24 11:10:28', '2025-05-26 16:26:46', 1),
(7, 1, 4, '2025-05-26 16:27:11', '2025-05-26 16:27:11', 1),
(8, 1, 14, '2025-05-26 16:27:12', '2025-05-26 16:27:12', 1),
(9, 1, 15, '2025-05-26 16:27:14', '2025-05-26 16:27:14', 1),
(10, 1, 16, '2025-05-26 16:27:17', '2025-05-26 16:27:17', 1),
(11, 1, 17, '2025-05-26 16:27:19', '2025-05-26 16:27:19', 1);

-- --------------------------------------------------------

--
-- Table structure for table `eleve_quiz_reponses`
--

CREATE TABLE `eleve_quiz_reponses` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `examen_resultat_id` int(11) NOT NULL,
  `reponse_donnee` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `est_correcte` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_quiz_reponses`
--

INSERT INTO `eleve_quiz_reponses` (`id`, `eleve_id`, `quiz_id`, `examen_resultat_id`, `reponse_donnee`, `est_correcte`) VALUES
(1, 1, 1, 3, '[]', 1),
(6, 1, 1, 6, '[]', 1),
(7, 1, 1, 7, '[]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `examens`
--

CREATE TABLE `examens` (
  `id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `seuil_reussite` float DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examens`
--

INSERT INTO `examens` (`id`, `cours_id`, `titre`, `seuil_reussite`) VALUES
(1, 3, 'certifie toi', 50),
(3, 1, 'cvcvcvcvcvcv', 50);

-- --------------------------------------------------------

--
-- Table structure for table `formateur`
--

CREATE TABLE `formateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `bio` text DEFAULT NULL,
  `specialites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specialites`)),
  `qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications`)),
  `taux_reussite` float DEFAULT NULL,
  `methode_pedagogique` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `formateur`
--

INSERT INTO `formateur` (`id`, `nom`, `prenom`, `email`, `password_hash`, `created_at`, `last_login`, `is_active`, `bio`, `specialites`, `qualifications`, `taux_reussite`, `methode_pedagogique`) VALUES
(1, 'jerkey', 'jin', 'jin@gmail.com', 'scrypt:32768:8:1$dRbWR2C8VmyDQ3nH$25b32b63f40b2257fc1826279d62a6e9c993ce88b973a16b93a2c176f6d587116c06033170af9aadc260fdf4b72452472b89d2b956361ace4f2206d0d60d78aa', '2025-03-21 11:50:15', '2025-05-31 12:18:48', 1, 'fdfdfdfdf', '[\"Chimie\", \"mathematique\", \"science\"]', '[\"bac\"]', NULL, 'Pratique');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `type` enum('document','texte','vidéo') NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `ordre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `cours_id`, `type`, `titre`, `contenu`, `ordre`) VALUES
(1, 1, 'texte', 'demarage', 'tout apprendre sur les competene en physique', 1),
(2, 1, 'document', 'tout a savoir', 'modele-statuts-ohada-sas-1.pdf', 1),
(3, 1, 'vidéo', 'et de trois', 'Home_-_X_2.mp4', 1),
(4, 3, 'document', 'boum', 'BIIC_CardLess_Specification_ICPS-Middle.pdf', 1),
(10, 2, 'document', 'normale', '', 1),
(11, 2, 'document', 'normale', '', 1),
(14, 3, 'document', 'abou', 'BIIC_CardLess_Specification_ICPS-Middle.pdf', 1),
(15, 3, 'vidéo', 'video', 'Home_-_X_2.mp4', 1),
(16, 3, 'vidéo', 'azer', 'Actu_Foot_on_X-__UNE_PLAINTE_AUPRES_DE_LA_CHAMBRE_DENQUETE_DU_COMITE_DETHIQUE_DE_LA_FIFA_REQUIERT..._2_ANS_DINTERDICTION_DE_.mp4', 1),
(17, 3, 'vidéo', 'yty', 'Home_-_X_3_1748010308.mp4', 1),
(18, 2, 'vidéo', 'ga', 'Actu_Foot_on_X-__UNE_PLAINTE_AUPRES_DE_LA_CHAMBRE_DENQUETE_DU_COMITE_DETHIQUE_DE_LA_FIFA_REQUIERT..._2_ANS_DINTERDICTION_DE_.mp4', 1),
(19, 2, 'vidéo', 'aza', 'VID-20250517-WA0011.mp4', 1),
(20, 3, 'vidéo', 'sam', 'VID-20250517-WA0011.mp4', 1);

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `reponse_correcte` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Stocke les index (0-based) des réponses correctes dans le tableau options',
  `points` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `examen_id`, `question`, `options`, `reponse_correcte`, `points`) VALUES
(1, 1, 'qui est l\'autre ', '[\"boum\", \"baomm\", \"fdfd\", \"dfdfd\"]', '[]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `reponsecommentaires`
--

CREATE TABLE `reponsecommentaires` (
  `id` int(11) NOT NULL,
  `formateur_id` int(11) NOT NULL,
  `commentaire_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reponsecommentaires`
--

INSERT INTO `reponsecommentaires` (`id`, `formateur_id`, `commentaire_id`, `contenu`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'merci vraiment', '2025-04-17 12:46:59', '2025-04-17 12:46:59'),
(2, 1, 1, 'fdfdfdfdfdfgfg', '2025-04-17 12:50:42', '2025-04-17 12:50:42'),
(3, 1, 1, 'merci\n', '2025-04-17 13:00:54', '2025-04-17 13:00:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `commentaires`
--
ALTER TABLE `commentaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formateur_id` (`formateur_id`);

--
-- Indexes for table `eleve`
--
ALTER TABLE `eleve`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD UNIQUE KEY `prenom` (`prenom`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_eleve_cours` (`eleve_id`,`cours_id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- Indexes for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_eleve_module` (`eleve_id`,`module_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `examen_resultat_id` (`examen_resultat_id`);

--
-- Indexes for table `examens`
--
ALTER TABLE `examens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cours_id` (`cours_id`);

--
-- Indexes for table `formateur`
--
ALTER TABLE `formateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- Indexes for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formateur_id` (`formateur_id`),
  ADD KEY `commentaire_id` (`commentaire_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `commentaires`
--
ALTER TABLE `commentaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `eleve`
--
ALTER TABLE `eleve`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `examens`
--
ALTER TABLE `examens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `formateur`
--
ALTER TABLE `formateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  ADD CONSTRAINT `chatbot_conversations_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `chatbot_conversations_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `commentaires_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `commentaires_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `cours`
--
ALTER TABLE `cours`
  ADD CONSTRAINT `cours_ibfk_1` FOREIGN KEY (`formateur_id`) REFERENCES `formateur` (`id`);

--
-- Constraints for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  ADD CONSTRAINT `eleve_cours_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_cours_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  ADD CONSTRAINT `eleve_examen_resultats_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_examen_resultats_ibfk_2` FOREIGN KEY (`examen_id`) REFERENCES `examens` (`id`);

--
-- Constraints for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  ADD CONSTRAINT `eleve_module_progression_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_module_progression_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`);

--
-- Constraints for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_3` FOREIGN KEY (`examen_resultat_id`) REFERENCES `eleve_examen_resultats` (`id`);

--
-- Constraints for table `examens`
--
ALTER TABLE `examens`
  ADD CONSTRAINT `examens_ibfk_1` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`examen_id`) REFERENCES `examens` (`id`);

--
-- Constraints for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  ADD CONSTRAINT `reponsecommentaires_ibfk_1` FOREIGN KEY (`formateur_id`) REFERENCES `formateur` (`id`),
  ADD CONSTRAINT `reponsecommentaires_ibfk_2` FOREIGN KEY (`commentaire_id`) REFERENCES `commentaires` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
