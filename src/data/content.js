export const profile = {
  name: 'René Descartes',
  firstName: 'René',
  role: 'Développeur full-stack & designer UI/UX',
  location: 'Matadi, RDC',
  email: 'no.codescreen@gmail.com',
  phone: '+243 891 755 172',
  whatsapp: 'https://wa.me/243891755172',
  whatsappMsg:
    "Bonjour René, je vous contacte depuis votre portfolio. J'aimerais discuter d'un projet avec vous.",
  cvUrl: '/cv/Rene-Descartes-CV.pdf',
  lumoRepo: 'https://github.com/nocodescreen-tech/LUMO',
  lumoLive: 'https://lumo-frontend-production-1dba.up.railway.app/',
  links: {
    linkedin: 'https://www.linkedin.com/in/rene-descartes-1b7413408',
    github: 'https://github.com/nocodescreen-tech',
    facebook: 'https://www.facebook.com/share/1EWzugxkMX/',
  },
}

export const lumo = {
  title: 'LUMO',
  subtitle: "L'outil qui aide les petits commerces à gérer ventes et stocks simplement, au quotidien.",
  stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'JWT', 'OAuth'],
  built: [
    'Gestion des ventes',
    'Gestion des achats',
    'Gestion des stocks et produits',
    'Gestion des clients et fournisseurs',
    'Authentification et rôles (RBAC)',
    'Tableau de bord et statistiques',
    'Déploiement en production',
  ],
}

export const about = {
  intro: "Je suis René Descartes, développeur full-stack et technicien informatique, basé à Matadi, en RDC.",
  paragraphs: [
    "Je construis des applications web complètes : de l'interface à la base de données, jusqu'à la mise en ligne. LUMO, ma plateforme de gestion commerciale, est un projet que j'ai pensé, conçu et développé seul, de la première maquette à la production.",
    "Avant le code, il y a la machine. Formé en maintenance informatique, je comprends le matériel, le réseau et le logiciel — ça m'aide à livrer des solutions qui fonctionnent vraiment, et à dire honnêtement quand quelque chose n'est pas encore prêt.",
    "Travailler depuis Matadi apprend la rigueur : chaque requête compte, chaque outil doit tenir sur un usage réel, au quotidien.",
  ],
  education: {
    title: 'Licence en Technique de Maintenance (Bac+3)',
    school: "ISIPA Matadi — Institut Supérieur d'Informatique, Programmation et Analyse",
  },
  domains: ['Développement web', 'Applications métier', 'Maintenance informatique', 'LAN / Wi-Fi', 'Sécurité réseau'],
}

export const services = [
  {
    n: '01',
    title: 'Sites vitrines',
    text: "Un site rapide et soigné qui présente votre activité, de la maquette au déploiement.",
    tags: ['React', 'Tailwind', 'Vercel'],
  },
  {
    n: '02',
    title: 'Applications métier',
    text: 'Ventes, achats, stocks, clients : des outils sur mesure pour gérer votre activité au quotidien.',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
  },
  {
    n: '03',
    title: 'E-commerce',
    text: 'Boutiques en ligne avec catalogue, comptes clients et gestion des commandes.',
    tags: ['React', 'JWT', 'PostgreSQL'],
  },
  {
    n: '04',
    title: 'Maintenance informatique',
    text: 'Diagnostic, entretien et dépannage de postes informatiques.',
    tags: ['Hardware', 'Windows', 'Sécurité'],
  },
  {
    n: '05',
    title: 'Réseaux',
    text: 'Installation, configuration et maintenance de réseaux LAN / Wi-Fi.',
    tags: ['LAN', 'Wi-Fi', 'Sécurité'],
  },
]

/* Source unique des compétences (la grille affichée dans Skills). */
export const skillGroups = [
  {
    id: 'uiux',
    label: 'UI/UX',
    icon: 'fa-pen-ruler',
    desc: 'Interfaces claires et utiles, pensées pour l’usage.',
    items: ['Design d’interface', 'Prototypage', 'Figma', 'Design system'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    icon: 'fa-code',
    desc: 'Des interfaces rapides, réactives et accessibles.',
    items: ['React', 'Tailwind CSS', 'JavaScript (ES6+)', 'HTML5', 'CSS3'],
  },
  {
    id: 'backend',
    label: 'Backend & données',
    icon: 'fa-server',
    desc: 'Des API propres, une logique métier solide, des données fiables.',
    items: ['Node.js', 'Express.js', 'PostgreSQL', 'SQL'],
  },
  {
    id: 'securite',
    label: 'Sécurité & API',
    icon: 'fa-shield-halved',
    desc: 'Des données protégées et des accès maîtrisés.',
    items: ['REST API', 'JWT', 'Google OAuth', 'RBAC'],
  },
  {
    id: 'outils',
    label: 'Outils & déploiement',
    icon: 'fa-rocket',
    desc: 'Des outils de travail soignés et des mises en ligne maîtrisées.',
    items: ['Git', 'GitHub', 'VS Code', 'Postman', 'Railway', 'Vercel'],
  },
  {
    id: 'materiel',
    label: 'Matériel & réseaux',
    icon: 'fa-laptop',
    desc: 'La machine et le réseau avant le code : maintenance et infrastructures.',
    items: ['Maintenance PC', 'LAN / Wi-Fi', 'Sécurité réseau'],
  },
]

export const timeline = [
  {
    period: '2026',
    title: 'Licence en Technique de Maintenance (Bac+3)',
    place: 'ISIPA Matadi — Institut Supérieur d’Informatique, Programmation et Analyse',
    tag: 'Diplôme',
  },
  {
    period: '2022 – 2023',
    title: 'Anglais — niveaux 1 et 2',
    place: 'Formation en anglais général',
    tag: 'Langue',
  },
  {
    period: '2022',
    title: 'Réseaux informatiques — niveau 1',
    place: 'Formation technique',
    tag: 'Réseaux',
  },
  {
    period: 'Depuis 2024',
    title: 'Développement web — en pratique',
    place: 'Projets personnels et applications concrètes',
    tag: 'Expérience',
  },
]
