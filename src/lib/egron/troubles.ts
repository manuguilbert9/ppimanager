/**
 * Référentiel des troubles : notion, incidences sur les apprentissages et
 * pistes pédagogiques.
 *
 * D'après Bruno Egron, « Enseigner en unité d'enseignement », Retz, 2021,
 * partie 2 « Les différents troubles » (chapitres 4 à 9).
 *
 * Rappel de la démarche : la connaissance du trouble est un inducteur de
 * l'observation, mais elle ne suffit jamais. Les enfants sont souvent
 * porteurs de plusieurs troubles, et chaque enfant présente une variété des
 * conséquences d'un trouble : une identification fine des besoins de l'élève
 * par l'observation reste nécessaire. Les élèves ont rarement besoin de
 * l'ensemble des adaptations décrites : il appartient à l'enseignant, en
 * tenant compte des besoins de l'élève, de déterminer les aménagements
 * pertinents.
 */

export type PistesTheme = {
  theme: string;
  items: string[];
};

export type Trouble = {
  id: string;
  label: string;
  /** Famille de troubles (chapitre du livre). */
  category: string;
  /** Résumé de la notion. */
  notion: string;
  incidences: string[];
  pistes: PistesTheme[];
};

export const TROUBLES: Trouble[] = [
  {
    id: 'tfc',
    label: "Troubles des fonctions cognitives (déficience intellectuelle)",
    category: 'Troubles des fonctions cognitives',
    notion:
      "Troubles de l'efficience intellectuelle qui affectent les capacités de traitement de l'information, d'abstraction et de transfert. L'efficience varie fortement d'un enfant à l'autre : une identification fine des besoins par l'observation est indispensable.",
    incidences: [
      "Langage : difficultés à comprendre les messages verbaux et à s'exprimer, en relation avec un lexique et une syntaxe faibles.",
      'Mémoire de travail peu performante et vite saturée.',
      "Attention et concentration réduites, davantage par fatigabilité que par trouble spécifique.",
      "Champ de l'imaginaire restreint : difficulté à circuler dans le « comme si », la fiction.",
      "Capacité limitée d'abstraction et de généralisation : peu d'inférences, de liens, ce qui entrave le raisonnement, la déduction logique, la chronologie.",
      "Difficulté à transférer les acquis d'une situation à une autre.",
      "Prise d'informations : peu d'informations traitées à la fois, fixation sur des détails non significatifs, lenteur dans la construction d'images mentales.",
      "Conduite de la tâche : rigidité, reproduction de modes de résolution antérieurs, peu de contrôle exécutif (anticipation, vérification), lenteur.",
      "Aspects relationnels : conscience de la faiblesse de ses moyens, découragement, manque de confiance en soi, besoin d'être soutenu et valorisé.",
    ],
    pistes: [
      {
        theme: 'Proposer un cadre bienveillant et structurant',
        items: [
          'Porter un regard positif, encourager efforts et initiatives, valoriser toute réussite sans excès.',
          "Instaurer une relation sécurisante par une écoute empathique, en contenant et cadrant les éventuels débordements.",
          "Avoir la bonne distance physique : la durée et la qualité de l'attention sont en relation avec la distance qui sépare l'élève de l'enseignant.",
          'Ritualiser les activités dans un déroulement prévisible, structurer le temps avec des outils fonctionnels.',
          "Anticiper et préparer tout évènement imprévu ou changement (sortie, classe transplantée...).",
          "Placer les activités dans un cadre prévisible en structurant l'espace classe.",
        ],
      },
      {
        theme: 'Étayer les fonctionnements cognitifs',
        items: [
          "Accorder une place importante au corps et aux sens : voir, entendre, toucher, sentir, goûter ; utiliser la mémoire kinesthésique et le support visuel plus que l'audition.",
          'Privilégier la communication sous toutes ses formes (non verbale et verbale), avec un langage simple, des démonstrations, des médias variés et du concret.',
          "Contextualiser la situation d'apprentissage : présenter clairement la finalité (pourquoi on fait ce travail) et la finalisation (le résultat attendu).",
          "Clarifier les consignes en s'appuyant sur plusieurs canaux sensoriels (oral, visuel, écrit, gestes), reformuler, s'adresser individuellement à l'élève, expliciter et numéroter les étapes.",
          "Adapter la tâche pour maintenir l'élève en réussite : séquencer en tâches intermédiaires accessibles, limiter leur durée, donner des repères temporels (horloge, sablier).",
          "Développer la manipulation pour accéder à la symbolisation, accompagnée d'une verbalisation de la démarche (pédagogie explicite).",
          "Tenir compte de la lenteur de pensée : donner du temps, multiplier les temps d'apprentissage d'une même notion. Le temps de latence avant une réponse ne doit pas être pris pour une non-réponse.",
        ],
      },
      {
        theme: "Adapter les supports d'apprentissage",
        items: [
          'Privilégier une présentation simple, aérée, structurée, régulière et prévisible ; éviter la multiplication des informations sur un même support.',
          "Différencier spatialement les exercices, augmenter l'espace entre les mots et les lignes, utiliser le surlignage en phase d'exploration.",
          "En lecture : segmenter les textes, favoriser une lecture continue à l'aide de repères (suivre avec le doigt, points de couleur en début/fin de ligne, cache).",
          "Organiser les affichages et mémentos par domaine d'apprentissage, clairs, lisibles depuis chaque table et compréhensibles.",
        ],
      },
    ],
  },
  {
    id: 'comportement',
    label: 'Troubles du comportement',
    category: 'Troubles des fonctions cognitives',
    notion:
      "Difficultés psychologiques dont l'expression, notamment l'intensité des troubles du comportement, perturbe gravement la socialisation et l'accès aux apprentissages, malgré des potentialités intellectuelles et cognitives préservées (TDA-H, troubles des conduites, troubles oppositionnels avec provocation...).",
    incidences: [
      'Une relation adulte/enfant difficile, mise à l\'épreuve en permanence.',
      "Une gestion des émotions perturbée : difficultés à se décentrer, interprétation souvent erronée des intentions d'autrui ressenties comme hostiles, émotions ressenties fortement avec des réactions hors de proportion.",
      "Des manifestations pulsionnelles non retenues exprimant des angoisses non mises en mots (insultes, provocations, agressions).",
      "Une faible estime de soi : peur de l'échec, « peur d'apprendre » (S. Boimare) ; fuite de toute mentalisation par la provocation, le refus, l'isolement.",
      "Un rapport à la loi difficile et fluctuant : immédiateté, intolérance à la frustration, difficulté à accepter les contraintes de la vie en groupe.",
    ],
    pistes: [
      {
        theme: 'Organiser un cadre éducatif cohérent',
        items: [
          "Travailler en équipe : un projet commun qui définit les objectifs éducatifs et les moyens, des temps de partage d'informations, un plan d'actions coordonnées et graduées en cas de crise.",
          "Connaître l'enfant : comment réagit-il aux frustrations, quelles situations font monter l'angoisse, faut-il être cadrant ou s'appuyer sur le groupe ?",
          "Créer avec l'élève un cadre relationnel bienveillant : institutionnaliser des moments réguliers, hors classe, pour faire le point sur ses ressentis et expliciter les objectifs.",
          "Planifier les transitions en équipe (passages de cycle, d'établissement) : définir les objectifs, préparer la structure d'accueil et l'enfant (visite préalable, entretiens réguliers).",
          "Gérer et structurer l'environnement temporel et spatial.",
        ],
      },
      {
        theme: 'Soutenir et renforcer les comportements attendus',
        items: [
          'Identifier avec les élèves les comportements attendus et enseigner des habiletés sociales (comment se joindre à un groupe, manifester son désaccord...).',
          'Récompenser les comportements adaptés plutôt que sanctionner les comportements inadaptés : la rétroaction positive doit être trois fois plus fréquente que la négative.',
          "Proposer des contrats de comportement accessibles, signés par l'enseignant et l'élève, définissant les actions de chacun, les conséquences, la durée et la date de renégociation.",
          'Annoncer et célébrer les succès comportementaux.',
        ],
      },
      {
        theme: 'Prévenir et gérer les débordements et les crises',
        items: [
          "Gérer les problèmes mineurs de manière positive et immédiate, en utilisant l'humour sans jamais humilier.",
          'Anticiper les comportements difficiles chroniques et établir des plans de gestion de crise.',
          "En crise : assurer la sécurité de tous, écarter le jeune du regard des autres, contenir sans violence avec une parole apaisante, puis proposer une activité et un lieu de répit.",
          "Reprendre ensuite la situation avec l'enfant : décrire le comportement, identifier l'incidence sur les autres, chercher d'autres modes d'expression, entendre la victime, éventuellement sanctionner.",
          "Sanctionner de manière éducative : sanction individuelle, portant sur des actes identifiés, appelant une réparation et permettant la réinsertion dans le groupe.",
        ],
      },
      {
        theme: "Travailler les émotions et reconstruire le sentiment de compétence",
        items: [
          "Permettre l'identification grâce à des contenus culturels structurants : mythes, récits initiatiques, contes (nourrissage culturel de S. Boimare).",
          "Aider la sublimation par les pratiques de création et d'expression (récit, photo, peinture...).",
          "Favoriser l'expression et le contrôle des émotions : activités théâtrales, marionnettes, EPS et jeux d'opposition dans un cadre social, temporel et spatial limité.",
          'Aider à se décentrer : jeux théâtraux (théâtre forum), ateliers philo, lecture de romans et de biographies.',
          "Amener les élèves à construire des activités à long terme, à se projeter dans un projet de formation.",
          "Détacher l'évaluation du travail de l'évaluation de la personne ; pointer régulièrement les progrès et les capitaliser.",
          "Enseigner en se référant aux programmes ; ne pas sous-alimenter cognitivement les élèves : la reconstruction de l'estime de soi passe par un obstacle surmonté.",
        ],
      },
    ],
  },
  {
    id: 'tsa',
    label: "Troubles du spectre de l'autisme (TSA)",
    category: 'Troubles des fonctions cognitives',
    notion:
      "Trouble neurodéveloppemental présent dès la petite enfance, caractérisé par des altérations cumulées de la communication verbale et non verbale, des relations sociales, et un répertoire d'intérêts et d'activités restreint, stéréotypé et répétitif. Grande hétérogénéité des manifestations ; pas de corrélation systématique avec la déficience intellectuelle. Avec un accompagnement adapté, l'enfant peut progresser dans tous les domaines.",
    incidences: [
      "Rigidité mentale et besoin d'immuabilité : difficulté à transférer les acquisitions.",
      "Traitement de l'information focalisé sur les détails, appréhension fragmentée du message.",
      'Difficultés très importantes à catégoriser et conceptualisation restreinte (un concept = un mot) ; la reformulation est comprise comme une nouvelle consigne.',
      'Planification, organisation et contrôle des tâches complexes.',
      "Accès à l'imaginaire et au symbolique limité ; parfois zones de surcompétences.",
      "Empathie difficile : situations sociales mal comprises, méconnaissance des codes sociaux, coût attentionnel important pour analyser une situation sociale.",
      "Émotions difficiles à repérer, nommer et exprimer ; crises ayant toujours une raison logique mais difficile à identifier.",
      'Troubles sensoriels fréquents (hypo/hypersensibilité de tous les sens) et troubles moteurs possibles.',
    ],
    pistes: [
      {
        theme: 'Connaître et articuler les méthodes éducatives',
        items: [
          "Connaître les méthodes utilisées par la famille et les professionnels (TEACCH, ABA, PECS, Makaton, scénarios sociaux, autorégulation) pour adapter le cadre de travail : l'école respecte le choix familial de prise en charge.",
          'Reprendre les principes transversaux : structuration de l\'environnement, renforçateurs, prévisibilité des situations sociales.',
          'Évoquer ces éléments en équipe de suivi de scolarisation et avec les partenaires.',
        ],
      },
      {
        theme: 'Adapter le langage et les situations de communication',
        items: [
          'Simplifier le message : précis, sans détour, sans doubles sens, métaphores, implicites ni traits d\'humour.',
          'Être cohérent entre les indications verbales et non verbales.',
          'Soutenir l\'information par des gestes ou du visuel (pictogramme, image, mots écrits) qui ajoutent une permanence au message.',
          "Laisser un temps de latence pour intégrer et traiter le message.",
          "Si une consigne doit être répétée, la répéter à l'identique : une reformulation serait comprise comme une autre consigne.",
        ],
      },
      {
        theme: "Structurer le temps, l'espace et les activités",
        items: [
          "Délimiter matériellement le temps : timer, sablier, planning, emploi du temps ritualisé.",
          "Délimiter les espaces de travail : aires d'activités précises, repères visuels, pictogrammes, photos, zones marquées au ruban adhésif.",
          'Ne mettre à disposition que le matériel nécessaire pour limiter les stimulations parasites.',
          "Adapter et ritualiser la tâche pour qu'elle soit rassurante ; stabiliser l'activité avant de la faire varier à des fins de généralisation.",
          'Respecter des transitions entre activités : un temps de pause court compense le coût attentionnel et cognitif.',
        ],
      },
      {
        theme: 'Structurer les interactions sociales',
        items: [
          'Travailler la compréhension des codes sociaux, des expressions et des émotions.',
          "S'appuyer sur des images séquentielles pour les logiques évènementielles et les inférences simples.",
          'Étudier les expressions faciales et corporelles pour décoder les émotions.',
          'Enseigner des protocoles pour des situations sociales diverses (dire bonjour, conversation téléphonique, entrer dans une salle...).',
          "S'appuyer sur les intérêts de l'élève comme leviers d'apprentissage.",
        ],
      },
    ],
  },
  {
    id: 'psychiques',
    label: 'Troubles psychiques',
    category: 'Troubles des fonctions cognitives',
    notion:
      "Modalités de comportement profondément enracinées et durables, en déviation significative des perceptions, des pensées et des relations avec autrui (phobies, anxiété, TOC, troubles de l'humeur, troubles psychotiques...). Pour les enfants, les diagnostics sont rarement précisés. La psychose infantile est un trouble massif du sens de la réalité, une confusion du monde imaginaire et du monde perceptif.",
    incidences: [
      "Une pensée troublée : difficulté d'accès au symbolique, au second degré ; la pensée dérape, submergée par des associations imaginaires.",
      "Difficulté à se détacher d'un modèle et à créer une image mentale (a-symbolisation), ou au contraire sursymbolisation (associations multiples et personnelles compromettant la communication).",
      "Homogénéisation : les objets sont juxtaposés sans généralisation ni abstraction ; pas d'accès au lien de cause à effet, à la catégorisation — par processus défensif actif, non par carence d'intelligence.",
      "Fonctionnements cognitifs surprenants : surinvestissement de certains domaines, surdéveloppement de certaines fonctions (mémoire...), sentiment de persécution face aux exigences.",
      "Conceptualisation difficile : opérations mentales (comparaison, classification, analogie) non mises en œuvre.",
      "Angoisse massive non contenue, relations conflictualisées et clivées, crudité des thèmes imaginaires.",
    ],
    pistes: [
      {
        theme: 'Instaurer des contenants de pensée',
        items: [
          "Proposer un étayage externe dans un cadre pédagogique spécifique : cadre permanent, socialement repérable, ritualisé, ET flexible, singulier, malléable.",
          "Viser l'intériorisation du cadre et de l'étayage, prioritaire sur l'évolution des contenus.",
          "Assurer la sécurité interne de l'enfant en s'appuyant sur des repères externes ; donner un rôle prédominant à l'activité de l'enfant.",
        ],
      },
      {
        theme: "Apprendre le fonctionnement psychique de l'enfant",
        items: [
          "S'appuyer sur le symptôme : la focalisation sur un centre d'intérêt ou une capacité particulière peut servir d'entrée, voire de support aux apprentissages.",
          "Contourner le symptôme quand il est un obstacle : utiliser des chemins pédagogiques détournés plutôt que l'affronter directement.",
          "Maintenir le cadre et sa fonction de contenance (pare-excitation et symbolisation) pour éviter d'être envahi par les troubles de l'enfant.",
        ],
      },
      {
        theme: 'Sécuriser',
        items: [
          'Ritualiser pour moduler les émotions et canaliser l\'agressivité : signaux de base, structuration des échanges.',
          "Modéliser : l'enfant s'appuie sur l'activité de l'adulte pour développer la sienne, repérer les constantes, anticiper.",
          "Utiliser la pédagogie du contrat : le cadre est ajustable en fonction de l'enfant ; l'enseignant accueille, s'ajuste et accompagne.",
          "Maintenir la continuité : au niveau des contenus (opérations mentales, déductions, images mentales) et au niveau institutionnel (articulation des professionnels, objets de liaison comme le cahier de vie).",
        ],
      },
    ],
  },
  {
    id: 'moteurs',
    label: 'Troubles des fonctions motrices',
    category: 'Troubles des fonctions motrices',
    notion:
      "Atteinte de la capacité du corps à se mouvoir (origines cérébrale, médullaire, neuromusculaire, ostéoarticulaire...), limitant déplacements, postures, manipulation, communication, alimentation ou perception. Les difficultés d'apprentissage sont souvent davantage liées aux troubles associés qu'à la difficulté motrice elle-même.",
    incidences: [
      "Troubles praxiques : anomalies de planification et d'automatisation des gestes volontaires (manipulation, écriture, graphisme).",
      "Troubles neurovisuels : difficultés à fixer, à explorer l'espace, à suivre une cible ; diminution possible du champ visuel ; repères instables.",
      "Troubles du langage oral et/ou écrit : lenteur d'expression, dysarthrie, voix faible, difficultés à trouver un mot ou organiser sa pensée.",
      'Troubles de la mémoire (de travail et/ou à long terme).',
      "Troubles des fonctions cognitives : planification, compréhension de consignes complexes, organisation du travail, attention, conceptualisation.",
      'Fatigabilité et lenteur importantes ; douleur souvent peu exprimée à prendre en compte ; épilepsie possible.',
      "Aspects psychoaffectifs : émotivité, manque de confiance et d'estime de soi, dépendance affective liée aux soins, frustration.",
    ],
    pistes: [
      {
        theme: 'Compenser les incapacités',
        items: [
          "Soigner l'installation dans la classe (avec l'ergothérapeute si possible) : face au tableau, non isolé des camarades, confort vérifié régulièrement (croissance).",
          'Fournir le matériel spécifique adapté : chaise moulée, table à encoche, plan incliné, tapis antidérapant, scripteurs adaptés, règles lestées, ciseaux adaptés.',
          "Mobiliser l'aide humaine (AESH) pour l'EPS, les transferts et déplacements, le passage aux toilettes (à négocier avec l'enfant).",
        ],
      },
      {
        theme: 'Aménager les temps de travail et l\'évaluation',
        items: [
          "Tenir compte de la fatigue (soins, rééducations, trajets, lever précoce) : organiser un lieu et un temps de repos dans la journée.",
          "Adapter les tâches et le rythme : réduire les contraintes, donner des aides, dialoguer avec l'enfant et la famille pour un rythme optimal.",
          "Pour l'évaluation : temps supplémentaire, tâche moins longue, aide matérielle ou humaine, lieu propice à la concentration ; ne pas surestimer les résultats.",
        ],
      },
      {
        theme: 'Adapter pour les troubles praxiques et neurovisuels',
        items: [
          'Limiter les manipulations coûteuses (découpage, pliage, traçage) qui absorbent l\'énergie au détriment de la tâche cognitive.',
          'Limiter écriture manuelle et copie : textes à trous, QCM, réponses à surligner, trace écrite fournie, ordinateur.',
          "Adapter les supports écrits : informations limitées, présentation aérée et prévisible, typographie et contrastes adaptés, repères visuels (lignes surlignées, colonnes colorées, cache), éviter les exercices « relier ».",
          'En géométrie : règle à poignée, compas à vis centrale, logiciels adaptés. En mathématiques : privilégier la manipulation accompagnée, colonnes de couleurs pour les opérations.',
          'Laisser l\'élève placer sa feuille selon ses positions préférentielles.',
        ],
      },
      {
        theme: 'Soutenir le langage, la mémoire et la socialisation',
        items: [
          "Utiliser les codes de communication mis en place par l'orthophoniste ou l'ergothérapeute (langue des signes, synthèse vocale) avec toutes les personnes s'occupant de l'enfant.",
          "Mettre l'enfant en situation de communication dans tous les lieux de l'école (récréation, EPS, foyer...).",
          'Solliciter la mémoire de façon graduée, rappeler la tâche et les consignes, subdiviser les tâches complexes, améliorer les stratégies de mémorisation.',
        ],
      },
    ],
  },
  {
    id: 'vision',
    label: 'Troubles de la vision',
    category: 'Troubles sensoriels',
    notion:
      "De la malvoyance (acuité entre 1/20 et 4/10) à la cécité. Les critères légaux ne suffisent pas à appréhender la diversité des situations : vision floue, champ visuel altéré (scotomes), vision uniquement centrale ; nystagmus, sensibilité à la lumière, perturbation de la vision des couleurs.",
    incidences: [
      "Prise d'information difficile : environnement perçu de façon incomplète ou parcellaire ; lecture du tableau et des affichages en réelle difficulté.",
      "Pour les enfants aveugles : perceptions essentiellement auditives et verbales ; interactions sociales complexifiées (pas d'accès aux conventions apprises par imitation, aux mimiques, à la gestuelle).",
      'Gestion du temps différente : tout prend plus de temps et requiert plus de concentration ; risque de surcharge cognitive.',
      "Fatigabilité accrue, difficilement perceptible pour l'enseignant ; tendance à se déconcentrer et s'isoler, parfois forme d'hyperactivité.",
      'Représentations mentales et conceptualisation plus longues à construire, surtout si la déficience est congénitale et profonde.',
    ],
    pistes: [
      {
        theme: "Aménager l'environnement",
        items: [
          "Présenter l'établissement en amont pour que l'élève prenne ses repères dans le calme ; préparer les camarades en termes modérés.",
          "Organiser sa place selon sa pathologie : près de la fenêtre ou dos à la lumière (photophobie), proximité du tableau, prise électrique, éclairage, plan de travail incliné et suffisamment grand.",
        ],
      },
      {
        theme: 'Adapter les documents et les situations',
        items: [
          'Agrandir les caractères selon le type de vision ; jouer sur les polices, contrastes, espacements de mots et de lignes.',
          "Préparer des documents nets, débarrassés des informations inutiles ; éventuellement un seul exercice par page.",
          'Au tableau : écrire gros, éviter les lignes trop longues ; craie jaune et tableau blanc plus lisibles ; donner un support individuel pour tout travail collectif.',
          "Autoriser à matérialiser des repères (pointer, souligner, surligner, barrer les questions traitées).",
          "Définir des protocoles d'apprentissage : tâches décomposées dans un ordre logique, protocoles de lecture explicités en amont (par où commencer, dans quel sens...).",
          'Oraliser tout ce qui est écrit, avec un vocabulaire précis et stable pour nommer et décrire.',
          'Mettre en place des activités tactiles en mettant en mots (préparatoires au braille pour les enfants aveugles).',
          'Solliciter précocement la mémoire auditive.',
          'Limiter la quantité de production écrite, remplacer si possible par des réponses orales.',
          'Donner un temps plus long (un document en arial 12 = 3 pages en braille) ; éliminer les activités redondantes.',
          "Autoriser et encourager le matériel nécessaire (ordinateur, bloc-notes braille, téléagrandisseur, loupe, dictaphone, pupitre) et les aides humaines (AESH, camarades).",
        ],
      },
    ],
  },
  {
    id: 'audition',
    label: "Troubles de l'audition",
    category: 'Troubles sensoriels',
    notion:
      "Perte complète ou partielle de la capacité à entendre (surdité légère à totale, de transmission, de perception ou mixte). Chaque élève est unique dans sa surdité. Aucun appareillage ne restitue une audition normale. Important : percevoir n'est pas comprendre.",
    incidences: [
      "Faible confiance en lui : jamais sûr de la compréhension du message reçu, peut se mettre à l'écart et ne pas oser redemander.",
      "Relations difficiles : insécurité affective, difficultés à entrer en relation avec les pairs ; besoin parfois de retrouver l'identité « sourde ».",
      "La maîtrise de l'oral est l'obstacle majeur : vocabulaire pauvre (manque de bain de langage), confusions de mots proches, syntaxe mal acquise, petits mots de la langue (déterminants, connecteurs) peu accessibles.",
      "Conscience phonologique coûteuse à construire pour les élèves oralistes.",
      "Passage à l'écrit difficile : 10 à 20 % du vocabulaire d'un texte peut être inconnu ; inférences et implicite compliqués ; prise de notes très difficile (regarder et écrire).",
      'Suppléance mentale permanente : fatigabilité et lenteur ; interprétation pas toujours fiable, sans conscience d\'avoir mal compris.',
    ],
    pistes: [
      {
        theme: 'Pallier le trouble',
        items: [
          "Connaître l'appareillage individuel (prothèses, implant cochléaire) et utiliser les systèmes collectifs (boucle magnétique, transmission HF avec micro de l'enseignant).",
          "Connaître le mode de communication choisi par la famille : LSF, français signé, lecture labiale, LPC, méthode verbo-tonale.",
        ],
      },
      {
        theme: 'Renforcer la communication',
        items: [
          'Exagérer la mimo-gestualité ; accentuer le mouvement des lèvres et les expressions du visage.',
          "Éviter ce qui interrompt l'échange : disparaître du champ de vision, parler en tournant le dos.",
          'Compléter le message par des informations visuelles : illustrations, croquis, écrits.',
          "Parler naturellement, ni trop vite ni trop lentement, sans crier ; écrire au tableau tout terme nouveau.",
        ],
      },
      {
        theme: "Aménager l'environnement et les situations",
        items: [
          'Aménager la salle : classe calme, peu sonore (les bruits de fond sont très amplifiés par les prothèses).',
          "Placer l'enfant selon ses spécificités : souvent au deuxième rang, entre deux camarades, dos à la lumière pour la lecture labiale ; lors d'un débat, l'installer de façon à voir tous les échanges.",
          "Réduire la difficulté de compréhension : réexpliquer, reformuler, LPC ou LSF si besoin ; en lecture suivie, faire suivre la ligne du doigt par un camarade ; donner au préalable explications et consignes.",
        ],
      },
    ],
  },
  {
    id: 'polyhandicap',
    label: 'Polyhandicap',
    category: 'Polyhandicap',
    notion:
      "Handicap grave à expressions multiples associant déficience motrice et déficience mentale sévère ou profonde, entraînant une restriction extrême de l'autonomie et des possibilités de perception, d'expression et de relation. Atteintes multiples et intriquées : motrices, organiques (épilepsie...), cognitives, relationnelles, communicationnelles.",
    incidences: [
      'Une grande lenteur dans les gestes et les mouvements : chaque geste est coûteux.',
      "Un décalage important dans le développement : éviter le piège de ne proposer que des projets d'âge maternel à des enfants qui ont quitté cet âge.",
      'Un retard dans le développement de la communication verbale ou non verbale.',
      'Une grande fragilité (infections, opérations, soins) entraînant des absences fréquentes ; une extrême fatigabilité ; des douleurs fréquentes.',
      'Des problèmes de stockage en mémoire, de représentation mentale et de fabrication des images mentales.',
      "Une estime de soi dévalorisée ; un état parfois dépressif. La classe est souvent leur « jardin secret », où ils sont considérés comme des personnes et non comme des malades.",
    ],
    pistes: [
      {
        theme: 'Adapter le cadre et les progressions',
        items: [
          "S'adapter à leur lenteur : trouver le bon dosage entre laisser faire l'élève (risque d'épuisement) et faire à sa place.",
          "Prendre en compte l'hétérogénéité des compétences : proposer des compétences du cycle où il en est, intégrées dans un projet de son âge ; consignes simples, répétées, pictographiées.",
          "Individualiser les progressions et les emplois du temps : les absences ne doivent pas grever un apprentissage, qui sera repris individuellement.",
          'Porter attention à leur confort : connaître les douleurs de posture et les gestes qui les atténuent.',
        ],
      },
      {
        theme: 'Développer la communication et soutenir les apprentissages',
        items: [
          "Développer le langage et/ou une communication alternative (PECS, Makaton, Coghamo) en travail conjoint avec l'orthophoniste, l'ergothérapeute et les parents.",
          'Soutenir la mémoire avec des supports (images, pictogrammes) ; répéter en vérifiant la compréhension et la mise en mémoire.',
          "Favoriser les représentations mentales : vérifier la représentation que se fait l'élève d'une situation ou d'un mot (faible acculturation due à l'isolement).",
          "Consolider l'estime de soi : explicitation, feedback positif, mise en avant des acquis — sans faux feedback qui gommerait l'effort cognitif.",
        ],
      },
    ],
  },
  {
    id: 'dyslexie',
    label: 'Dyslexie / dysorthographie',
    category: 'Troubles spécifiques des apprentissages',
    notion:
      "Trouble spécifique des apprentissages avec déficit en lecture, très souvent associé à une difficulté à maîtriser l'orthographe (dysorthographie). Se manifeste chez des enfants à l'intelligence préservée, sans problème sensoriel ni neurologique identifiable.",
    incidences: [
      'Difficultés à discriminer les sons proches, faible conscience phonologique.',
      'Problèmes dans le traitement orthographique : confusions et inversions de lettres, mauvais codage de la position des lettres.',
      'Mauvaise association graphèmes-phonèmes, incapacité à saisir rapidement un mot dans sa globalité.',
      'Problèmes visuo-attentionnels possibles ; anxiété de performance et manque de confiance en soi fréquemment associés.',
    ],
    pistes: [
      {
        theme: 'Lecture',
        items: [
          'Développer la conscience phonologique en manipulant les syllabes ; utiliser les gestes Borel-Maisonny en appui visuel des sons.',
          "Permettre à l'enfant de lire à mi-voix ; utiliser les livres audio ; ne pas forcer la lecture à haute voix.",
          'Proposer un support clair et aéré (interligne 1,5 ou 2), surligner une ligne sur deux, découper les mots en syllabes de couleurs différentes, règle ou cache pour suivre les lignes.',
          "Face à un texte avec questions : placer la question avant le texte, permettre de surligner la phrase-réponse, laisser plus de temps pour les consignes.",
        ],
      },
      {
        theme: 'Écrit et graphisme',
        items: [
          'Fournir des photocopies claires et aérées ; éviter la copie au maximum (énoncés, traces écrites).',
          'En expression écrite : réduire les attentes en quantité et préciser les exigences qualitatives (privilégier la cohérence, le fond à la forme, accepter les ratures).',
          'Proposer de joindre le plan des écrits ; favoriser les cartes mentales ; accepter le matériel informatique en classe.',
          'Autoriser une écriture large sans respect des interlignes.',
        ],
      },
      {
        theme: 'Mathématiques',
        items: [
          'Insister sur la maîtrise de la comptine numérique à l\'oral.',
          'Entretenir le calcul mental ; donner les tables de multiplication ; permettre la calculatrice pour la résolution de problèmes.',
          'Utiliser des colonnes de couleurs pour poser les calculs ; attention à l\'inversion possible des chiffres et des signes.',
        ],
      },
      {
        theme: 'Évaluation',
        items: [
          "Valoriser et évaluer les connaissances à l'oral.",
          'Donner plus de temps ou diminuer la quantité tout en restant exigeant sur la qualité.',
          'Permettre les aide-mémoire en sous-main ; en dictée, limiter l\'écrit ou donner des dictées à trous ciblées sur les règles travaillées.',
          'Répartir les évaluations dans le temps pour éviter la surcharge cognitive.',
        ],
      },
    ],
  },
  {
    id: 'dyscalculie',
    label: 'Dyscalculie',
    category: 'Troubles spécifiques des apprentissages',
    notion:
      "Trouble spécifique des apprentissages avec déficit du calcul : mauvaise perception des quantités numériques (sens du nombre), socle des habiletés arithmétiques. Souvent combinée à un trouble du langage ou de la coordination.",
    incidences: [
      'Mauvaise perception des quantités numériques.',
      "Difficultés de mémorisation et d'apprentissage des tables d'addition et de multiplication.",
      'Difficultés de transcodage entre les formes chiffrée et littérale des nombres.',
    ],
    pistes: [
      {
        theme: 'Dénombrement et traitement numérique',
        items: [
          "Favoriser le dénombrement d'objets concrets par la manipulation plutôt que par l'écrit.",
          'Laisser à disposition une bande numérique adaptée.',
          'Laisser à disposition des tables avec les deux formes écrites du nombre (chiffrée et littérale).',
          'Éviter les dictées de nombres sans aide ni support ; distinguer erreurs de calcul et erreurs d\'écriture des nombres (faire verbaliser).',
        ],
      },
      {
        theme: 'Calcul',
        items: [
          "Accepter que l'élève compte sur ses doigts : étape importante qui peut durer plus longtemps.",
          'Permettre le matériel de manipulation pour les concepts ; code couleur pour la pose des opérations.',
          "Laisser à disposition les tables d'addition et de multiplication ; autoriser la calculatrice.",
        ],
      },
      {
        theme: 'Évaluation',
        items: [
          "Réduire la quantité d'exercices ; autoriser la manipulation d'objets ; laisser les aide-mémoire nécessaires.",
        ],
      },
    ],
  },
  {
    id: 'dysphasie',
    label: 'Dysphasie (trouble du langage oral)',
    category: 'Troubles spécifiques des apprentissages',
    notion:
      "Trouble du langage oral pouvant concerner la phonologie (paroles indistinctes, mots déformés), le vocabulaire ou la syntaxe, parfois associé à un trouble de la compréhension. Risque de trouble de la lecture associé dans plus de 50 % des cas.",
    incidences: [
      'Difficultés de prononciation, vocabulaire et syntaxe touchés.',
      "Trouble fréquent de l'abstraction : comprend mieux ce qui est concret, visible, manipulable.",
      'Troubles fréquents de la perception du temps et/ou de l\'espace.',
      'Troubles fréquents de la numération du fait des troubles langagiers.',
    ],
    pistes: [
      {
        theme: 'Communication',
        items: [
          "Susciter des situations de communication ; s'assurer de la compréhension du message (reformulation, questions).",
          'En groupe classe, ne permettre qu\'à un seul enfant de parler à la fois.',
          "Au niveau réceptif : langage simple et concret, parler lentement, articuler, une consigne à la fois, soutenir le verbal par du non-verbal (pictogrammes, mimiques, signes).",
          "Au niveau expressif : permettre de s'exprimer avec des gestes ou des images ; accepter les erreurs expressives mais reformuler correctement.",
        ],
      },
      {
        theme: 'Organisation',
        items: [
          'Aider la planification séquentielle des activités ; emploi du temps avec pictogrammes, dessins, couleurs ; apprendre à utiliser un agenda ; travailler avant/après.',
          "Favoriser un environnement stable dans la classe ; l'aider à se repérer dans l'école ; alterner activités verbales et non verbales.",
          'Donner moins de devoirs (prises en charge nombreuses) mais exiger une certaine qualité.',
        ],
      },
      {
        theme: 'Lecture et écriture',
        items: [
          "Favoriser rapidement l'entrée dans la lecture : la syllabe peut être une entrée plus propice ; travailler la conscience phonologique ; s'appuyer sur les méthodes gestuelles (Borel-Maisonny).",
          "En cas de dysphasie expressive importante, un début par la mémorisation de mots (voie d'adressage) peut faciliter le démarrage.",
          'Faire de nombreux allers-retours entre oral, écrit et pictogrammes.',
          'En expression écrite : réduire la quantité, privilégier la cohérence, fournir des exemples de phrases toutes faites.',
        ],
      },
      {
        theme: 'Mathématiques et évaluation',
        items: [
          'Insister sur la comptine numérique ; utiliser des représentations figuratives des nombres et des codes couleurs (centaines, dizaines, unités).',
          'Lire les énoncés avec l\'élève et s\'assurer de leur compréhension ; découper les problèmes en étapes ; manipuler, schématiser, varier les contextes.',
          'Évaluer une compétence à la fois ; permettre le matériel non verbal ; donner plus de temps ; répartir les évaluations.',
        ],
      },
    ],
  },
  {
    id: 'dyspraxie',
    label: 'Dyspraxie (trouble développemental de la coordination)',
    category: 'Troubles spécifiques des apprentissages',
    notion:
      "Impossibilité d'automatiser un certain nombre de gestes volontaires, notamment l'écriture (dysgraphie). Les tâches motrices absorbent une grande partie de l'attention au détriment des autres aspects. Souvent associée à des anomalies de repérage spatial et de motricité des yeux.",
    incidences: [
      'Difficultés à planifier, programmer, coordonner et automatiser des gestes complexes.',
      "L'écriture absorbe l'attention et empêche de traiter l'orthographe ou le sens.",
      "Anomalies de repérage et d'organisation spatiale ; difficultés visuo-spatiales (tableaux à double entrée très difficiles).",
      'Maladresse au quotidien (rangement, collage, manipulation).',
    ],
    pistes: [
      {
        theme: 'Motricité et organisation',
        items: [
          'Décomposer les gestes en gestes simples puis complexifier ; verbaliser pour décrire les gestes ; limiter les manipulations ; une tâche à la fois.',
          "Ne pas punir la maladresse ; lui permettre de sortir un peu avant les autres pour ne pas être bousculé.",
          'Seuls les outils nécessaires sur le bureau ; aider au rangement et au collage ; vérifier les devoirs dans l\'agenda ; apprendre à utiliser des surligneurs.',
        ],
      },
      {
        theme: 'Graphisme et écriture',
        items: [
          'Aider au repérage sur la feuille (marge verte à gauche, rouge à droite) ; autoriser une écriture large, interlignes en couleur.',
          'Éviter la copie, très fatigante ; éviter les schémas ; privilégier l\'épellation à la copie pour l\'orthographe.',
          'Réduire les attentes en quantité en expression écrite ; favoriser le matériel informatique.',
        ],
      },
      {
        theme: 'Lecture et mathématiques',
        items: [
          'Support clair et aéré, sans distracteurs ; repères de début de texte ; surligner une ligne sur deux ; règle ou cache ; livres audio.',
          "En mathématiques, les problèmes sont souvent instrumentaux et non conceptuels : insister sur la comptine numérique orale, représentations figuratives, limiter le dénombrement par manipulation (guider la main), stratégies de calcul mental, colonnes de couleurs, calculatrice.",
          'Limiter les attentes en géométrie ou proposer des logiciels ; faire verbaliser les reproductions géométriques ; limiter les tableaux à double entrée.',
        ],
      },
      {
        theme: 'Évaluation',
        items: [
          "Privilégier l'évaluation à l'oral ; donner plus de temps ou diminuer la quantité ; dictées à trous ciblées ; lire les questions avant le texte.",
        ],
      },
    ],
  },
  {
    id: 'tdah',
    label: "TDA-H (déficit de l'attention avec ou sans hyperactivité)",
    category: 'Troubles spécifiques des apprentissages',
    notion:
      "Difficultés à se concentrer et à soutenir l'attention lors d'une tâche : erreurs d'inattention, travail inabouti, non-respect des consignes, mauvaise organisation. Plus de 50 % des enfants concernés présentent d'autres troubles des apprentissages associés.",
    incidences: [
      "Erreurs d'inattention nombreuses, travail inabouti.",
      'Difficulté à filtrer les distracteurs.',
      'Impulsivité, débordements, difficulté à attendre.',
      'Difficultés de planification et d\'organisation.',
    ],
    pistes: [
      {
        theme: "Troubles de l'attention",
        items: [
          'Limiter au maximum les distracteurs (pas à côté d\'une fenêtre, éviter les affichages inutiles).',
          'Insister sur les informations importantes ; exiger le calme lorsqu\'une information importante est donnée.',
          'Alterner les périodes d\'efforts et de détente ; faire et afficher un emploi du temps.',
        ],
      },
      {
        theme: 'Hyperactivité / impulsivité',
        items: [
          'Afficher les règles de vie ; convenir d\'un signal discret pour spécifier un comportement inadapté ; tolérer les débordements mineurs.',
          "Apprendre à ne commencer une tâche qu'une fois la consigne lue jusqu'au bout ; décider de signaux pour commencer une activité.",
          'Anticiper les changements de routine pour faciliter les transitions.',
        ],
      },
      {
        theme: 'Réaliser une tâche',
        items: [
          'Décomposer la tâche en sous-tâches pour aider la planification ; mettre l\'accent sur les points importants (souligner, entourer).',
          "Surveiller l'exécution et recentrer si nécessaire ; bannir la double tâche ; utiliser un timer.",
        ],
      },
      {
        theme: 'Motricité et communication',
        items: [
          "Permettre à l'enfant de bouger (distribuer les cahiers, sorties gérées) ; manipuler une petite balle lors des activités d'écoute ; ne pas le priver de récréation.",
          'Limiter le nombre de consignes orales ; vérifier l\'attention avant de parler ; parler clairement en insistant sur les mots importants ; vérifier la compréhension.',
          "Encourager l'enfant à demander de ralentir ou des explications ; inciter à anticiper à partir d'indices contextuels.",
        ],
      },
    ],
  },
];

export function getTrouble(id: string): Trouble | undefined {
  return TROUBLES.find((t) => t.id === id);
}

export function getTroubles(ids: string[]): Trouble[] {
  return ids
    .map((id) => getTrouble(id))
    .filter((t): t is Trouble => t !== undefined);
}

export const TROUBLE_CATEGORIES = Array.from(
  new Set(TROUBLES.map((t) => t.category))
);
