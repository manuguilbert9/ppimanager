# Application FlashPPI

## Description Générale

FlashPPI est une application web conçue pour les enseignants, coordinateurs et professionnels de l'éducation spécialisée. Son objectif principal est de simplifier et d'optimiser la création, la gestion et le suivi des Projets Pédagogiques Individualisés (PPI) pour les élèves à besoins éducatifs particuliers.

L'application centralise toutes les informations relatives à un élève, structure la rédaction des PPI en sections claires, et intègre des outils d'intelligence artificielle pour assister les professionnels dans leur travail. En automatisant les tâches répétitives et en fournissant des suggestions pertinentes, FlashPPI permet de se concentrer sur l'essentiel : la mise en place d'un accompagnement pédagogique de qualité, cohérent et véritablement individualisé.

---

## Cahier des Charges Fonctionnel

### 1. Gestion des Élèves et des Classes

#### Objectif
Permettre une gestion centralisée et claire des fiches élèves et de leur appartenance à une classe.

#### Interface Utilisateur
-   **Page "Classes"** : Une page affichant une table simple listant toutes les classes. Chaque ligne montre le nom de la classe et le nom de l'enseignant. Un bouton "Ajouter une classe" est visible en haut de la page.
-   **Page "Élèves"** : Une page principale affichant une table de tous les élèves. Les colonnes incluent une photo d'avatar, le nom complet de l'élève, sa classe, l'âge, le statut de son PPI (ex: Brouillon, Validé), et la date de dernière modification. Les en-têtes de colonnes permettent de trier la liste. Un bouton "Ajouter un élève" est présent.
-   **Actions par ligne** : Sur les deux listes, chaque ligne possède un menu d'actions (via une icône "trois points") permettant de "Modifier" ou "Supprimer" l'élément.

#### Fonctionnalités
-   **Ajouter/Modifier une classe** : Une fenêtre modale (pop-up) apparaît avec des champs pour le nom de la classe et le nom de l'enseignant.
-   **Ajouter/Modifier un élève** : Une fenêtre modale plus détaillée permet de saisir les informations administratives de l'élève (nom, prénom, date de naissance...) et de l'assigner à une classe via un menu déroulant.
-   **Supprimer un élément** : Une boîte de dialogue de confirmation apparaît pour éviter les suppressions accidentelles. Pour un élève, il faut retaper son prénom pour valider la suppression.

---

### 2. Éditeur de PPI

#### Objectif
Fournir une interface structurée et intuitive pour créer et modifier le Projet Pédagogique Individualisé d'un élève.

#### Interface Utilisateur
-   **Page principale** : La page est dédiée à un seul élève, dont le nom est affiché en grand dans l'en-tête.
-   **Sections distinctes** : Le contenu du PPI est divisé en sections claires, chacune présentée dans une "carte" (un bloc visuel) avec un titre et une couleur de fond subtilement différente pour une identification facile :
    1.  **Informations administratives** (bleu clair)
    2.  **Profil global de l'élève** (gris clair)
    3.  **Points d'appui** (vert clair)
    4.  **Difficultés** (rose/rouge clair)
    5.  **Besoins éducatifs** (bleu ciel)
    6.  **Objectifs prioritaires** (violet clair)
-   **Contenu des sections** : Chaque carte contient des champs de formulaire (champs de texte, listes à puces, menus déroulants) correspondant à son contenu. Les listes d'éléments (ex: "Points d'appui") permettent d'ajouter ou de supprimer des items dynamiquement.
-   **Bouton de sauvegarde** : Un bouton "Sauvegarder les modifications" apparaît en bas à droite de l'écran, de manière flottante, uniquement si des changements ont été apportés.

#### Fonctionnalités
-   **Saisie structurée** : L'utilisateur remplit les champs dans chaque section.
-   **Gestion dynamique des listes** : L'utilisateur peut ajouter autant de points forts, de difficultés, de besoins ou d'objectifs qu'il le souhaite.
-   **Sauvegarde automatique** : Les modifications sont sauvegardées en une seule fois via le bouton flottant.

---

### 3. Bibliothèque d'Éléments Réutilisables

#### Objectif
Faire gagner du temps et assurer la cohérence en centralisant les formulations communes pour les besoins, objectifs, etc.

#### Interface Utilisateur
-   **Dans l'éditeur de PPI** : Les champs de saisie pour les listes (besoins, points forts, etc.) sont des "combobox". En tapant, l'utilisateur voit une liste de suggestions issues de la bibliothèque. Il peut soit sélectionner une suggestion, soit créer une nouvelle entrée.
-   **Page "Bibliothèque"** : Une page dédiée avec un menu vertical listant toutes les catégories d'éléments (ex: "Aménagements pédagogiques", "Difficultés cognitives"). En cliquant sur une catégorie, la liste des éléments enregistrés s'affiche dans la zone principale.

#### Fonctionnalités
-   **Auto-complétion** : Le système suggère des éléments existants lors de la saisie dans l'éditeur de PPI.
-   **Alimentation automatique** : Toute nouvelle entrée créée dans un PPI est automatiquement ajoutée à la bibliothèque pour être réutilisée plus tard.
-   **Consultation centralisée** : Les utilisateurs peuvent parcourir et gérer l'ensemble des éléments de la bibliothèque sur la page dédiée.

---

### 4. Assistance par Intelligence Artificielle

#### Objectif
Assister l'utilisateur dans les tâches de rédaction et d'analyse en fournissant des suggestions intelligentes et contextuelles.

#### Interface Utilisateur
-   **Boutons "Suggérer par IA"** : Dans les sections "Besoins" et "Objectifs" de l'éditeur de PPI, un bouton avec une icône d'étincelles est présent.
-   **Affichage des suggestions** : Après un clic, une zone apparaît sous le bouton, présentant une liste de suggestions (ex: 3 à 5 besoins pertinents). Chaque suggestion est un bouton cliquable.
-   **Assistant Conversationnel (Chatbot)** : Une icône "robot" dans la barre de navigation latérale ouvre un panneau de chat. L'utilisateur peut y poser des questions pédagogiques générales.

#### Fonctionnalités
-   **Suggestions de besoins** : L'IA analyse les sections "Points d'appui" et "Difficultés" pour proposer des besoins éducatifs adaptés.
-   **Suggestions d'objectifs** : L'IA analyse le profil complet de l'élève pour proposer des objectifs d'apprentissage prioritaires.
-   **Ajout en un clic** : Cliquer sur une suggestion l'ajoute directement au champ correspondant dans le PPI.
-   **Expert Pédagogique** : Le chatbot peut définir des termes techniques, expliquer des méthodes pédagogiques ou donner des idées d'activités.

---

### 5. Pilotage et Groupes de Travail

#### Objectif
Offrir une vue d'ensemble des objectifs de tous les élèves et aider à la création de groupes de besoin homogènes.

#### Interface Utilisateur
-   **Page "Pilotage"** : Une page avec un bouton principal "Lancer l'analyse par IA". Une fois l'analyse terminée, la page affiche des cartes, chacune représentant un "groupe de travail" suggéré.
-   **Carte de Groupe** : Chaque carte affiche un titre de groupe (ex: "Développement de la lecture fluide"), une brève justification, et la liste des élèves concernés avec leur objectif spécifique.
-   **Page "Groupes"** : Une page listant tous les groupes qui ont été sauvegardés. Chaque ligne permet de voir les détails, modifier, supprimer ou exporter la fiche du groupe.

#### Fonctionnalités
-   **Analyse IA** : L'IA analyse tous les objectifs actifs de tous les élèves et les regroupe par similarité sémantique et par niveau.
-   **Sauvegarde des groupes** : L'utilisateur peut sauvegarder les groupes suggérés qui lui semblent pertinents.
-   **Gestion des groupes** : L'utilisateur peut ensuite modifier manuellement les groupes sauvegardés (changer le titre, ajouter/retirer un élève).

---

### 6. Export de Documents

#### Objectif
Permettre de générer des documents Word (.docx) propres et professionnels à partir des données de l'application.

#### Interface Utilisateur
-   **Boutons "Exporter"** : Des boutons d'export sont présents à plusieurs endroits :
    -   Sur la liste des PPI, pour exporter le PPI complet d'un élève.
    -   Dans l'en-tête de l'éditeur de PPI, un bouton "Générer un écrit" pour exporter une synthèse rédigée par l'IA.
    -   Sur la liste des groupes de travail sauvegardés.

#### Fonctionnalités
-   **Export de PPI** : Génère un document Word complet, bien formaté, reprenant toutes les sections du PPI.
-   **Export de Synthèse** : L'IA rédige un texte de présentation de l'élève (environ 300 mots) basé sur son profil, et l'exporte au format Word.
-   **Export de Fiche Groupe** : Génère une fiche de suivi simple pour un groupe de travail, listant les participants et leur objectif.
-   **Téléchargement** : Le clic sur un bouton d'export lance directement le téléchargement du fichier .docx sur l'ordinateur de l'utilisateur.
