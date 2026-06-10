/**
 * Grille d'observation des fonctionnements de l'élève.
 *
 * D'après Bruno Egron, « Enseigner en unité d'enseignement », Retz, 2021,
 * chapitre 13 « Identifier les besoins des élèves ».
 *
 * La démarche : l'observation récolte des faits (sans jugement ni
 * interprétation), dans une pluralité de situations, par une pluralité de
 * regards (parents, professionnels). L'analyse vient dans un second temps :
 * pour chaque item pertinent pour l'élève, on identifie les besoins
 * importants et récurrents. Tous les besoins ne sont pas d'un même niveau,
 * il est ensuite nécessaire de faire des choix (hiérarchisation).
 */

export type ObservationItem = {
  id: string;
  label: string;
  /** Observables proposés par la grille : ce que l'enseignant peut regarder. */
  observables: string;
  /** Besoins éventuels (dans la sphère scolaire) associés à cet item. */
  needs: string[];
};

export type ObservationDomain = {
  id: string;
  title: string;
  /** Pourquoi observer ce champ, en référence à la démarche d'Egron. */
  description: string;
  items: ObservationItem[];
};

export const OBSERVATION_DOMAINS: ObservationDomain[] = [
  {
    id: 'scolarite',
    title: 'La scolarité',
    description:
      "Définir si la difficulté a une cause structurelle ou est liée à un évènement. L'absence de scolarité ou une scolarisation réduite permet de moduler la cause d'un niveau scolaire réduit : difficultés d'apprentissage ou manque d'apprentissages ?",
    items: [
      {
        id: 'cursus',
        label: 'Cursus scolaire',
        observables:
          "Cursus régulier ou non, maintien(s) de cycle, difficultés présentes depuis le début de la scolarité ou apparues en cours, temps hebdomadaire ou annuel de scolarisation.",
        needs: [
          "de temps de scolarisation renforcés",
          "de reprise d'apprentissages non construits",
          "d'un parcours sécurisé et continu",
        ],
      },
      {
        id: 'prises-en-charge',
        label: 'Prises en charge antérieures et actuelles',
        observables:
          "Suivis dans et hors l'établissement (orthophonie, ergothérapie, soutien psychologique...). Quelle évaluation de ces prises en charge, quelles évolutions chez l'enfant ?",
        needs: [
          "d'une harmonisation des interventions entre professionnels",
          "de poursuite ou de réajustement des suivis",
          "d'échanges réguliers avec les professionnels de soin",
        ],
      },
    ],
  },
  {
    id: 'famille',
    title: 'Les conditions de vie familiales',
    description:
      "Comprendre l'enfant, s'appuyer sur le fonctionnement familial et associer la famille au projet. Il ne s'agit pas de chercher la source des difficultés dans la famille, mais de définir ce que l'on peut lui demander et sur quoi on peut s'appuyer : la plupart des familles sont les spécialistes de leur enfant.",
    items: [
      {
        id: 'cadre-de-vie',
        label: 'Le cadre de vie',
        observables:
          "Espace de vie pour l'enfant, organisation familiale éventuelle autour du handicap, relation avec la fratrie, activités sportives, culturelles ou de loisirs.",
        needs: ["d'un cadre contenant", "d'un cadre sécurisant"],
      },
      {
        id: 'regard-parents',
        label: 'Le regard des parents sur la scolarité',
        observables:
          "Investissement, surinvestissement ou désinvestissement, aide aux devoirs, cadre culturel accompagnant les contenus d'apprentissage.",
        needs: [
          "d'apprentissages « déscolarisés »",
          "d'accompagnement scolaire hors famille",
          "d'ouverture culturelle",
        ],
      },
      {
        id: 'projet-parental',
        label: "Le projet parental pour l'enfant",
        observables: "Regard porté sur l'enfant, présence ou absence de projet pour lui.",
        needs: ["d'un projet de formation", 'de réassurance'],
      },
    ],
  },
  {
    id: 'sensorimoteur',
    title: 'Le fonctionnement sensorimoteur',
    description:
      "Le premier geste lorsqu'un élève est en difficulté d'apprentissage : vérifier que son fonctionnement sensorimoteur est opérationnel, avant d'évoquer d'autres pistes. Trop de déficiences légères restent ignorées et découvertes trop tard. Le diagnostic appartient aux personnels médicaux et paramédicaux.",
    items: [
      {
        id: 'motricite-globale',
        label: 'Coordination motrice globale',
        observables:
          "L'adresse : déplace aisément son corps ou est maladroit dans ses déplacements et manipulations. La vitesse d'exécution des gestes. La fatigabilité : réalisation d'une activité motrice dans un temps acceptable pour son âge.",
        needs: [
          "d'aide aux déplacements",
          'de techniques palliatives à la déficience motrice',
          'de renforcement du développement moteur',
          'de temps supplémentaire',
          "d'activités fragmentées",
        ],
      },
      {
        id: 'motricite-fine',
        label: 'Motricité fine',
        observables:
          "L'efficacité : maîtrise du graphisme, de l'écriture ou des gestes fins selon son âge. La précision gestuelle (lancers, préhensions...).",
        needs: [
          "d'aide à l'écriture (guide-doigt, outils adaptés)",
          'de matériel adapté',
          "d'adaptation des supports de travail",
        ],
      },
      {
        id: 'parler',
        label: 'Parler',
        observables:
          "La production de sons : produit des sons ou ne parle pas. La vitesse d'élocution. La prononciation.",
        needs: [
          "d'outils de communication (langue des signes, pictogrammes...)",
          'de rééducation du langage',
        ],
      },
      {
        id: 'entendre',
        label: 'Entendre (percevoir les sons)',
        observables:
          "La perception : peut répéter une phrase dite à voix normale dans son dos à 2 mètres, peut isoler un son dans un brouhaha. La distinction : identifie deux ou plusieurs sons successifs.",
        needs: [
          "de rééducation de l'ouïe ou d'appareillage",
          'de techniques palliatives (LPC, LSF, Borel-Maisonny...)',
          "d'adaptation du cadre sonore (isolement, voix plus forte...)",
        ],
      },
      {
        id: 'voir',
        label: 'Voir (distinguer)',
        observables:
          "Repérage de deux signes distinctifs à 5 m. S'approche très près du support, ne voit pas au tableau, se frotte ou cligne des yeux, ferme un œil, maux de tête après effort visuel prolongé.",
        needs: [
          'de rééducation ou d\'appareillage (lunettes)',
          'de techniques palliatives à la déficience (braille)',
          "d'adaptation des supports (taille, contrastes, espaces...)",
        ],
      },
    ],
  },
  {
    id: 'psychoaffectif',
    title: 'Le fonctionnement psychoaffectif',
    description:
      "Identifier les fonctionnements liés à la personnalité de l'enfant, pour dégager les lignes de fragilité mais aussi les forces qui serviront de leviers pour surmonter les difficultés rencontrées.",
    items: [
      {
        id: 'estime-de-soi',
        label: "L'estime de soi",
        observables:
          "La confiance dans ses capacités : se définit comme capable d'effectuer la tâche demandée. L'investissement : se lance dans des activités nouvelles ou difficiles. La persévérance dans la tâche (gestion de la difficulté).",
        needs: [
          'de reconnaissance de ses compétences',
          'de soutien affectif',
          "d'un cadre bienveillant",
          "d'activités à sa portée",
          "d'outils d'aide",
          'de séquençage des apprentissages',
        ],
      },
      {
        id: 'autonomie-affective',
        label: "L'autonomie affective",
        observables:
          "La capacité à travailler seul, à penser seul, la capacité d'initiatives, la capacité à avoir un avis ou à faire des choix.",
        needs: [
          'de reconnaissance de ses compétences',
          "d'activités à sa portée",
          'de réussite',
          "de temps de travail sans l'adulte",
        ],
      },
      {
        id: 'emotions',
        label: 'La maîtrise des émotions',
        observables:
          "L'intensité : les émotions sont ressenties et exprimées très fortement. Le contrôle : l'enfant maîtrise ses émotions et reste réceptif aux régulations. L'expression : verbalisée plutôt que corporelle.",
        needs: [
          'de soutien psychologique (hors classe)',
          "de lieux et de temps d'expression de ses émotions",
          "de supports d'expression (activités artistiques, théâtre...)",
        ],
      },
      {
        id: 'projection',
        label: 'La projection',
        observables:
          'Le différé : peut mettre du temps entre le désir et sa réalisation.',
        needs: [
          "de rappels réguliers du sens de l'action",
          "d'activités de projet",
          "d'activités ayant du sens pour lui",
          "d'étayage pour soutenir le désir",
        ],
      },
    ],
  },
  {
    id: 'socioaffectif',
    title: 'Le fonctionnement socioaffectif',
    description:
      "Les difficultés comportementales sont à la fois à l'origine des difficultés scolaires et sociales, et la conséquence de difficultés d'apprentissage. Attention : ces paramètres dépendent du cadre de référence de l'observateur, et sont donc emplis de subjectivité.",
    items: [
      {
        id: 'regles-de-vie',
        label: 'Respecter les règles de vie',
        observables:
          "Connaissance du cadre de fonctionnement de la classe et des codes sociaux. Respect des règles établies. Acceptation des contraintes. Compréhension et acceptation des sanctions.",
        needs: [
          'de rapports aux autres dans un cadre social ordinaire',
          "d'un cadre structurant et contenant",
          'de connaître les règles sociales',
          "d'une loi, d'un règlement construits avec lui",
        ],
      },
      {
        id: 'relations-autrui',
        label: 'Avoir des relations avec autrui conformes aux règles sociales',
        observables:
          "Coopération : joue avec ses camarades ou s'isole. Communication : sollicite et répond aux sollicitations. Empathie : comprend les sentiments et ressentis des autres.",
        needs: [
          "d'appartenir à un groupe",
          'de sécurité',
          "d'affirmation",
          "d'indépendance",
          "d'expression de ses affects (parole ou création)",
        ],
      },
      {
        id: 'comportement',
        label: 'Maîtriser son comportement',
        observables: 'Résolution des conflits dans un cadre socialement acceptable.',
        needs: ["d'outils et de moments d'expression de ses affects"],
      },
    ],
  },
  {
    id: 'cognitif',
    title: 'Le fonctionnement cognitif général',
    description:
      "Les grandes fonctions cognitives transversales à tous les apprentissages (classification internationale des fonctionnements). C'est le champ qui concerne le plus spécifiquement l'enseignant : ne pas le délaisser au profit des seuls aspects familiaux ou psychoaffectifs.",
    items: [
      {
        id: 'memoire',
        label: 'Mémoire',
        observables:
          "Mémoire de travail : se souvient des données (5 ± 2) apprises dans les 2-3 minutes. Mémoire à long terme : capable d'apprendre un texte en lien avec son âge. Utilisation : possède des stratégies de mémorisation.",
        needs: [
          'de supports de mémoire (agendas, guides, mémentos...)',
          'de techniques de mémorisation',
          "de temps d'apprentissage réguliers et importants",
        ],
      },
      {
        id: 'expression-communication',
        label: "S'exprimer et communiquer",
        observables:
          'Modes de communication utilisés : verbale, gestuelle, expressive. Qualité de la communication : aisée, réduite, unilatérale.',
        needs: [
          "d'expression culturelle ou artistique",
          'de (ré)assurance',
          "d'outils de communication (PECS, Makaton...)",
          "de situations d'échanges",
        ],
      },
      {
        id: 'attention',
        label: 'Fatigabilité et attention',
        observables:
          "Durée : est attentif pendant la durée de l'activité. Sélection : attentif uniquement pendant les activités qui le motivent. Qualité : se concentre et ne se disperse pas facilement.",
        needs: [
          'de durée de travail aménagée (semaine, journée, activité)',
          "d'activités qui ont du sens pour lui",
          'de temps de repos',
        ],
      },
      {
        id: 'vitesse-execution',
        label: "Vitesse d'exécution (cognitive)",
        observables: 'Lente, normale ou rapide.',
        needs: [
          'de temps supplémentaire',
          "d'exercices d'entraînement et d'automatisation",
        ],
      },
      {
        id: 'temps',
        label: "S'orienter dans le temps",
        observables:
          "Repérage : comprend et utilise les marqueurs temporels (calendriers, emplois du temps, horloge...). Chronologie : place des évènements chronologiquement. Compréhension et utilisation des connecteurs temporels.",
        needs: [
          'de supports de représentation du temps',
          "d'acquisition d'un vocabulaire temporel et des connecteurs temporels",
        ],
      },
      {
        id: 'espace',
        label: "S'orienter dans l'espace",
        observables:
          "Repérage : se positionne dans l'espace de la classe, de l'école, de la ville. Topologie : connaît et utilise le vocabulaire spatial, reconnaît des formes simples. Déplacement : suit des itinéraires mémorisés. Outils : utilise carte, plan, GPS ; code et décode un espace.",
        needs: [
          'de vocabulaire spatial',
          "d'outils de repérage spatial dans diverses situations (déplacements, plans...)",
        ],
      },
    ],
  },
  {
    id: 'relation-apprentissages',
    title: 'La relation aux apprentissages',
    description:
      "L'ensemble des images, attentes et jugements portant sur le sens et la fonction sociale du savoir et de l'école. Le sens donné aux apprentissages se construit : c'est un acte pédagogique, préalable essentiel à l'acquisition de compétences. Désintérêt, apathie ou refus peuvent n'être que la résultante de situations éloignées des références culturelles de l'élève.",
    items: [
      {
        id: 'sens-ecole',
        label: "Compréhension du sens de l'école et des apprentissages",
        observables:
          "Peut donner un sens social (en dehors de l'école et de tout lien affectif) à son travail d'écolier.",
        needs: ["d'activités concrètes", "d'activités finalisées", 'de projets'],
      },
      {
        id: 'sens-activite',
        label: "Compréhension du sens de l'activité",
        observables:
          "Peut donner un sens social (en dehors de l'école et de tout lien affectif) à l'activité ou à la discipline.",
        needs: ["d'activités concrètes", "d'activités finalisées", 'de projets'],
      },
    ],
  },
  {
    id: 'processus-apprentissage',
    title: "Les processus d'apprentissage",
    description:
      "Trois moyens d'observation : l'analyse des travaux et des traces de l'élève (brouillons, erreurs de démarche), l'observation pendant l'exercice (exploration, utilisation des aides, sollicitations), et l'entretien métacognitif (questions en « comment », pas en « pourquoi »). Ces items s'observent dans des disciplines différentes : les dysharmonies cognitives sont fréquentes.",
    items: [
      {
        id: 'prise-informations',
        label: "Prise d'informations",
        observables:
          "Stratégie : lit en totalité les données, comportement exploratoire systématique, réfléchi, planifié. Vocabulaire : connaît les termes utilisés. Préalables : possède les savoirs nécessaires pour comprendre la nature de l'épreuve.",
        needs: [
          'de cadres stratégiques',
          'de notions préalables',
          'de modes et supports de présentation différents',
          "d'une réduction des paramètres",
          'de vocabulaire',
        ],
      },
      {
        id: 'mobilisation-connaissances',
        label: 'Mobilisation des connaissances',
        observables:
          "Transfert : peut convoquer des connaissances préalables, utilise des cadres de résolution déjà acquis. Automatisation : maîtrise des opérations mentales ou techniques déjà abordées.",
        needs: [
          "d'être confronté à des situations variées",
          'de supports mnésiques',
          "d'automatisation des procédures",
          "de temps et d'entraînement",
          'de manipulation',
        ],
      },
      {
        id: 'inferences-analogies',
        label: "Mise en œuvre d'inférences et d'analogies",
        observables:
          "Décentration : peut imaginer une situation (« si j'avais... »). Induction : produit une généralité à partir de plusieurs cas semblables. Inférences : interprète une situation à partir d'éléments non signifiés. Analogie : fait des liens entre acquis et situation proposée.",
        needs: [
          'de développement des connaissances',
          "d'identification des caractéristiques essentielles d'une situation",
          'de culture (sur le thème travaillé)',
          'de stratégies cognitives identifiées et/ou enseignées',
        ],
      },
      {
        id: 'anticipation-planification',
        label: 'Anticipation et planification',
        observables:
          "Peut dire ce qu'il faut faire pour résoudre le problème. Peut proposer plusieurs stratégies opérantes.",
        needs: ['de modèles de stratégies'],
      },
      {
        id: 'communication-resultats',
        label: 'Communication des résultats de son action',
        observables:
          "Décision : fait des choix (à l'opposé : scrupule, blocage). Communication : accepte de communiquer, modalités compréhensibles. Forme : se centre sur le fond plutôt que la forme.",
        needs: [
          'de réassurance',
          "d'accompagnement affectif",
          "d'outils procéduraux",
          'de diversité des modes de restitution',
        ],
      },
    ],
  },
];

export function getObservationDomain(id: string): ObservationDomain | undefined {
  return OBSERVATION_DOMAINS.find((d) => d.id === id);
}

export function getObservationItem(
  domainId: string,
  itemId: string
): ObservationItem | undefined {
  return getObservationDomain(domainId)?.items.find((i) => i.id === itemId);
}

/** Tous les besoins du référentiel, dédupliqués (pour les suggestions). */
export function getAllReferentialNeeds(): string[] {
  const needs = new Set<string>();
  for (const domain of OBSERVATION_DOMAINS) {
    for (const item of domain.items) {
      for (const need of item.needs) {
        needs.add(`Besoin ${need}`);
      }
    }
  }
  return Array.from(needs);
}
