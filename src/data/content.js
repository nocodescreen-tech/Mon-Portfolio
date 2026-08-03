export const profile = {
  name: 'René Descartes',
  firstName: 'René',
  role: 'Développeur Web Full Stack',
  roles: ['Développeur Web Full Stack', 'UI/UX Designer', 'Technicien en Maintenance Informatique'],
  location: 'Matadi, RDC',
  email: 'no.codescreen@gmail.com',
  phone: '+243 891 755 172',
  whatsapp: 'https://wa.me/243891755172',
  cvUrl: '/cv/Rene-Descartes-CV.pdf',
  lumoRepo: 'https://github.com/nocodescreen-tech/LUMO',
  lumoLive: 'https://lumo-frontend-production-1dba.up.railway.app/',
  links: {
    linkedin: 'https://www.linkedin.com/in/rene-descartes-1b7413408',
    github: 'https://github.com/nocodescreen-tech',
    facebook: 'https://www.facebook.com/share/1EWzugxkMX/',
  },
}

export const stats = [
  { value: 1, prefix: '+', suffix: ' an', label: "d'expérience en développement web" },
  { value: 7, suffix: '', label: 'domaines d’intervention' },
  { value: 1, suffix: '', label: 'projet phare — LUMO' },
  { value: 10, suffix: '+', label: 'technologies maîtrisées' },
]

export const qualities = [
  "Esprit d'analyse",
  'Résolution de problèmes',
  'Organisation',
  'Communication',
  'Autonomie',
  'Apprentissage continu',
  'Adaptabilité',
  'Travail en équipe',
  'Bonnes pratiques de développement',
  'Sens du détail',
  'Curiosité technique',
  'Veille technologique',
]

export const skillGroups = [
  {
    id: 'langages',
    label: 'Langages',
    code: '01',
    items: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'SQL'],
  },
  {
    id: 'frontend',
    label: 'Front-End',
    code: '02',
    items: ['React.js', 'Tailwind CSS'],
  },
  {
    id: 'backend',
    label: 'Back-End',
    code: '03',
    items: ['Node.js', 'Express.js'],
  },
  {
    id: 'bdd',
    label: 'Bases de données',
    code: '04',
    items: ['PostgreSQL'],
  },
  {
    id: 'api',
    label: 'API & Sécurité',
    code: '05',
    items: ['REST API', 'JWT Authentication', 'Google OAuth', 'RBAC'],
  },
  {
    id: 'outils',
    label: 'Outils',
    code: '06',
    items: ['Git', 'GitHub', 'VS Code', 'Postman'],
  },
  {
    id: 'deploiement',
    label: 'Déploiement',
    code: '07',
    items: ['Railway', 'Vercel'],
  },
]

export const lumoFeatures = [
  'Gestion des utilisateurs',
  'Authentification sécurisée',
  'Gestion des rôles (RBAC)',
  'Gestion des ventes',
  'Gestion des achats',
  'Gestion des stocks',
  'Gestion des produits',
  'Gestion des clients',
  'Gestion des fournisseurs',
  'Tableau de bord analytique',
  'Statistiques',
  'API REST + PostgreSQL',
]

export const lumoStack = ['React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS', 'JWT', 'Google OAuth']

export const timeline = [
  {
    period: "2026",
    title: 'Licence (Bac+3) en Technique de Maintenance',
    place: 'ISIPA Matadi — Institut Supérieur d’Informatique, Programmation et Analyse',
    type: 'formation',
    tag: 'Diplôme',
  },
  {
    period: '2022 – 2023',
    title: 'Formation en Anglais — Niveaux 1 & 2',
    place: 'Cours de langue',
    type: 'formation',
    tag: 'Langue',
  },
  {
    period: '2022',
    title: 'Formation en Réseaux Informatiques — Niveau 1',
    place: 'Formation technique',
    type: 'formation',
    tag: 'Réseaux',
  },
  {
    period: "Depuis plus d'un an",
    title: 'Développement web — pratique continue',
    place: 'Projets personnels & apprentissage permanent',
    type: 'experience',
    tag: 'Expérience',
  },
]

export const aboutParagraphs = [
  "Je suis un développeur full stack basé à Matadi, en RDC. Ce qui me guide ? Construire des applications utiles, pensées pour les gens qui les utilisent — c'est l'esprit de LUMO, mon projet phare.",
  "Je conçois et développe des plateformes web complètes — du front-end React jusqu'à la base de données PostgreSQL — avec le même soin pour l'expérience utilisateur que pour l'architecture du code.",
  "Formé à l'ISIPA Matadi, technicien en maintenance informatique et passionné de réseaux, j'apporte une vision systémique : je comprends la machine, le réseau, le code et l'utilisateur. Plus d'un an de pratique sur des projets personnels m'a appris à livrer, itérer et me remettre en question.",
]
