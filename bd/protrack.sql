-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 03:26 PM
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
-- Database: `protrack`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `table_affectee` varchar(50) DEFAULT NULL,
  `id_element` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `date_action` datetime DEFAULT current_timestamp(),
  `utilisateur_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `action`, `table_affectee`, `id_element`, `details`, `date_action`, `utilisateur_id`) VALUES
(1, 'CONNEXION', '', NULL, 'Utilisateur connecté: stevejerkey@gmail.com', '2025-07-20 00:16:34', 1),
(2, 'CONNEXION', '', NULL, 'Utilisateur connecté: jin@gmail.com', '2025-07-20 00:17:01', 2),
(3, 'CONNEXION', '', NULL, 'Utilisateur connecté: stevejerkey@gmail.com', '2025-07-20 00:41:31', 1),
(4, 'CONNEXION', '', NULL, 'Utilisateur connecté: jin@gmail.com', '2025-07-21 13:04:55', 2),
(5, 'CONNEXION', '', NULL, 'Utilisateur connecté: papa@gmail.com', '2025-07-21 13:07:53', 4),
(6, 'CONNEXION', '', NULL, 'Utilisateur connecté: papa@gmail.com', '2025-07-21 13:37:43', 4);

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE `document` (
  `IdDocument` int(11) NOT NULL,
  `LibelleDocument` varchar(150) NOT NULL,
  `DatePartage` timestamp NOT NULL DEFAULT current_timestamp(),
  `CheminFichier` text NOT NULL,
  `Taille` bigint(20) DEFAULT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Visibility` enum('publique','privee') DEFAULT 'privee',
  `ID_projet` int(11) DEFAULT NULL,
  `IdTache` int(11) DEFAULT NULL,
  `Id_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipe`
--

CREATE TABLE `equipe` (
  `IdEquipe` int(11) NOT NULL,
  `NomEquipe` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipe`
--

INSERT INTO `equipe` (`IdEquipe`, `NomEquipe`, `Description`) VALUES
(1, 'developpeur', '');

-- --------------------------------------------------------

--
-- Table structure for table `equipe_utilisateur`
--

CREATE TABLE `equipe_utilisateur` (
  `IdEquipe` int(11) NOT NULL,
  `Id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipe_utilisateur`
--

INSERT INTO `equipe_utilisateur` (`IdEquipe`, `Id_user`) VALUES
(1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `IdMessage` int(11) NOT NULL,
  `Contenu` text NOT NULL,
  `DateMessage` timestamp NOT NULL DEFAULT current_timestamp(),
  `Type` enum('commentaire','notification','message') DEFAULT 'message',
  `ID_projet` int(11) NOT NULL,
  `Id_user` int(11) NOT NULL,
  `Id_destinataire` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `IDNotif` int(11) NOT NULL,
  `Type` enum('email','portal') NOT NULL,
  `Date_envoie` timestamp NOT NULL DEFAULT current_timestamp(),
  `Sujet` varchar(255) DEFAULT NULL,
  `Contenu` text DEFAULT NULL,
  `Lu` tinyint(1) DEFAULT 0,
  `Id_user` int(11) NOT NULL,
  `ID_projet` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projet`
--

CREATE TABLE `projet` (
  `ID_projet` int(11) NOT NULL,
  `NomProjet` varchar(150) NOT NULL,
  `Description` text DEFAULT NULL,
  `DateCreationProjet` timestamp NOT NULL DEFAULT current_timestamp(),
  `DateDebut` date DEFAULT NULL,
  `DateFinPrevue` date DEFAULT NULL,
  `Statut_projet` enum('en_cours','termine','en_pause') DEFAULT 'en_cours',
  `Avancement` tinyint(3) UNSIGNED DEFAULT 0,
  `IdClient` int(11) NOT NULL,
  `IdEquipe` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taches`
--

CREATE TABLE `taches` (
  `IdTache` int(11) NOT NULL,
  `IntituleTache` varchar(150) NOT NULL,
  `Description` text DEFAULT NULL,
  `DateCreationTache` timestamp NOT NULL DEFAULT current_timestamp(),
  `DateDebutPrevue` date DEFAULT NULL,
  `DateFinPrevue` date DEFAULT NULL,
  `DateFinReelle` date DEFAULT NULL,
  `Statut` enum('à_faire','en_cours','terminée','bloquée') DEFAULT 'à_faire',
  `Priorite` enum('faible','moyenne','haute','critique') DEFAULT 'moyenne',
  `ID_projet` int(11) NOT NULL,
  `Id_user_assigne` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `Id_user` int(11) NOT NULL,
  `Nom_user` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Mot_passe` varchar(255) NOT NULL,
  `Date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone_user` varchar(20) DEFAULT NULL,
  `Role` enum('admin','client','administratif','secretaire','employe') NOT NULL,
  `ActiviteClient` varchar(150) DEFAULT NULL,
  `PaysClient` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `utilisateur`
--

INSERT INTO `utilisateur` (`Id_user`, `Nom_user`, `Email`, `Mot_passe`, `Date_creation`, `phone_user`, `Role`, `ActiviteClient`, `PaysClient`) VALUES
(1, 'Steve Jerkey', 'stevejerkey@gmail.com', 'scrypt:32768:8:1$TbG7GZv8rcNknvvY$95adf3a42c9799c8f0d40d6ec1d2c8d9ae678c2ed4ad20cf8cef9a1615e3b75627eff4c9184a7609cfaf4d747e6c0837d184dd07dae3cbcc946fd68b56a6417d', '2025-07-11 15:29:23', '0698312554', 'client', 'banque', 'Cameroun'),
(2, 'jin', 'jin@gmail.com', 'scrypt:32768:8:1$TbG7GZv8rcNknvvY$95adf3a42c9799c8f0d40d6ec1d2c8d9ae678c2ed4ad20cf8cef9a1615e3b75627eff4c9184a7609cfaf4d747e6c0837d184dd07dae3cbcc946fd68b56a6417d', '2025-07-15 12:26:23', '0698312554', 'admin', 'masseur', 'congo'),
(3, 'steve jerkey zeufack', 'stevezeufack@gmail.com', 'scrypt:32768:8:1$LSKZJWZshyty8lfj$88fac72aa07315057d60ca9e4aaaa9f688139d5138644dcea3026f53124a25ba43faa99c191d347f0153ada84219ee201a6348ea6a399efebb2112888e3e8b39', '2025-07-15 17:11:27', '698312554', 'client', 'banque', 'Cameroun'),
(4, 'papa', 'papa@gmail.com', 'scrypt:32768:8:1$r49BxMYGNzPeikfB$16dbc4e09f594d7919811c7b659823f624333a8595a3d5f4d4e2de173534ccc964bb7d18c051ba879814dc1b1f237ac78a0fca218d2ecc8107097f8bc88a2d98', '2025-07-21 12:07:35', '0698312554', 'secretaire', 'developeur', 'Cameroun');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`IdDocument`),
  ADD KEY `ID_projet` (`ID_projet`),
  ADD KEY `IdTache` (`IdTache`),
  ADD KEY `Id_user` (`Id_user`);

--
-- Indexes for table `equipe`
--
ALTER TABLE `equipe`
  ADD PRIMARY KEY (`IdEquipe`);

--
-- Indexes for table `equipe_utilisateur`
--
ALTER TABLE `equipe_utilisateur`
  ADD PRIMARY KEY (`IdEquipe`,`Id_user`),
  ADD KEY `Id_user` (`Id_user`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`IdMessage`),
  ADD KEY `ID_projet` (`ID_projet`),
  ADD KEY `Id_user` (`Id_user`),
  ADD KEY `idx_message_type` (`Type`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`IDNotif`),
  ADD KEY `Id_user` (`Id_user`),
  ADD KEY `ID_projet` (`ID_projet`);

--
-- Indexes for table `projet`
--
ALTER TABLE `projet`
  ADD PRIMARY KEY (`ID_projet`),
  ADD KEY `IdClient` (`IdClient`),
  ADD KEY `IdEquipe` (`IdEquipe`),
  ADD KEY `idx_projet_statut` (`Statut_projet`);

--
-- Indexes for table `taches`
--
ALTER TABLE `taches`
  ADD PRIMARY KEY (`IdTache`),
  ADD KEY `ID_projet` (`ID_projet`),
  ADD KEY `Id_user_assigne` (`Id_user_assigne`),
  ADD KEY `idx_taches_statut` (`Statut`),
  ADD KEY `idx_taches_priorite` (`Priorite`);

--
-- Indexes for table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`Id_user`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `IdDocument` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipe`
--
ALTER TABLE `equipe`
  MODIFY `IdEquipe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `IdMessage` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `IDNotif` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projet`
--
ALTER TABLE `projet`
  MODIFY `ID_projet` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taches`
--
ALTER TABLE `taches`
  MODIFY `IdTache` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `Id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE;

--
-- Constraints for table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `document_ibfk_1` FOREIGN KEY (`ID_projet`) REFERENCES `projet` (`ID_projet`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_ibfk_2` FOREIGN KEY (`IdTache`) REFERENCES `taches` (`IdTache`) ON DELETE SET NULL,
  ADD CONSTRAINT `document_ibfk_3` FOREIGN KEY (`Id_user`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE;

--
-- Constraints for table `equipe_utilisateur`
--
ALTER TABLE `equipe_utilisateur`
  ADD CONSTRAINT `equipe_utilisateur_ibfk_1` FOREIGN KEY (`IdEquipe`) REFERENCES `equipe` (`IdEquipe`) ON DELETE CASCADE,
  ADD CONSTRAINT `equipe_utilisateur_ibfk_2` FOREIGN KEY (`Id_user`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`ID_projet`) REFERENCES `projet` (`ID_projet`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_ibfk_2` FOREIGN KEY (`Id_user`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_ibfk_3` FOREIGN KEY (`Id_destinataire`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`Id_user`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`ID_projet`) REFERENCES `projet` (`ID_projet`) ON DELETE SET NULL;

--
-- Constraints for table `projet`
--
ALTER TABLE `projet`
  ADD CONSTRAINT `projet_ibfk_1` FOREIGN KEY (`IdClient`) REFERENCES `utilisateur` (`Id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `projet_ibfk_2` FOREIGN KEY (`IdEquipe`) REFERENCES `equipe` (`IdEquipe`) ON DELETE SET NULL;

--
-- Constraints for table `taches`
--
ALTER TABLE `taches`
  ADD CONSTRAINT `taches_ibfk_1` FOREIGN KEY (`ID_projet`) REFERENCES `projet` (`ID_projet`) ON DELETE CASCADE,
  ADD CONSTRAINT `taches_ibfk_2` FOREIGN KEY (`Id_user_assigne`) REFERENCES `utilisateur` (`Id_user`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
