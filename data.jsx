/* data.jsx — palette post-it, participants, et session de démo */

// Palette de post-its (vifs, façon papier)
const POSTIT_COLORS = [
  { id: "butter", name: "Beurre",   hex: "#ffe08a" },
  { id: "coral",  name: "Corail",   hex: "#ffb1a0" },
  { id: "rose",   name: "Rose",     hex: "#ffbcd9" },
  { id: "sky",    name: "Ciel",     hex: "#a9d6ff" },
  { id: "mint",   name: "Menthe",   hex: "#b3ecc6" },
  { id: "lilac",  name: "Lilas",    hex: "#d6c4ff" },
];

// Couleurs d'avatar
const AVATAR_COLORS = ["#F0563B", "#2E8B8B", "#7A5AE0", "#E8A317", "#C0457A", "#3A7BD5", "#4A9E5C"];

const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9);

// petite rotation pseudo-aléatoire mais stable par id
function tiltFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  return ((h / 1000) * 5 - 2.5); // -2.5deg .. +2.5deg
}

function makeParticipant(name, isAdmin = false, ci = 0) {
  return {
    id: uid("u"),
    name,
    isAdmin,
    color: AVATAR_COLORS[ci % AVATAR_COLORS.length],
  };
}

// Session de démonstration : une rétro de sprint à mi-collecte
function makeDemoSession() {
  const admin   = makeParticipant("Camille", true, 0);
  const yanis   = makeParticipant("Yanis", false, 1);
  const lea     = makeParticipant("Léa", false, 2);
  const maxime  = makeParticipant("Maxime", false, 3);
  const sofia   = makeParticipant("Sofia", false, 4);
  const theo    = makeParticipant("Théo", false, 5);
  const team = [admin, yanis, lea, maxime, sofia, theo];

  const colMood = { id: uid("col"), name: "Mood", emoji: "🌤️", accent: "#F0563B" };
  const colTech = { id: uid("col"), name: "Technique", emoji: "🛠️", accent: "#2E8B8B" };

  const N = (columnId, authorId, text, colorId, votes = []) => {
    const id = uid("p");
    return { id, columnId, authorId, text, colorId, votes, revealed: false, groupId: null, tilt: tiltFor(id) };
  };

  const postits = [
    // Mood
    N(colMood.id, yanis.id,  "Très bonne ambiance d'équipe ce sprint, on s'est vraiment entraidés 💪", "mint", [lea.id, sofia.id, theo.id]),
    N(colMood.id, lea.id,    "Frustrée par les réunions qui débordent — on perd le fil l'après-midi", "coral", [maxime.id, yanis.id]),
    N(colMood.id, sofia.id,  "Fière de la démo client, ça a vraiment payé le rush de jeudi", "rose", [admin.id, lea.id, yanis.id, theo.id]),
    N(colMood.id, maxime.id, "Un peu seul sur la partie data, j'aurais aimé du pairing", "butter", [theo.id]),
    N(colMood.id, theo.id,   "Le rythme était soutenable cette fois, merci pour le scope clair", "sky", [yanis.id]),

    // Technique
    N(colTech.id, maxime.id, "La CI est trop lente (12 min) — ça casse le flow des PR", "sky", [yanis.id, lea.id, theo.id, sofia.id, admin.id]),
    N(colTech.id, yanis.id,  "Trop de flaky tests sur le module paiement, on relance à l'aveugle", "coral", [maxime.id, theo.id, lea.id]),
    N(colTech.id, lea.id,    "Le nouveau design system nous a fait gagner un temps fou 🎉", "mint", [sofia.id, admin.id]),
    N(colTech.id, theo.id,   "Manque de doc sur le déploiement, j'ai galéré seul vendredi soir", "butter", [maxime.id]),
    N(colTech.id, sofia.id,  "Les revues de code sont devenues bien plus rapides et bienveillantes", "lilac", [lea.id, yanis.id]),
    N(colTech.id, yanis.id,  "On devrait figer les dépendances, deux mises à jour surprises cette semaine", "rose", [maxime.id]),
  ];

  return {
    version: 1,
    code: genCode(),
    title: "Rétro — Sprint 24",
    createdAt: Date.now(),
    phase: "collecte",            // collecte | revue
    columns: [colMood, colTech],
    participants: team,
    postits,
    currentUserId: admin.id,      // on démarre côté admin
    adminId: admin.id,
    timer: { running: false, endsAt: null, durationMin: 5 },
    simulate: false,
  };
}

// Nouvelle session vierge (créée par l'admin)
function makeFreshSession(adminName = "Admin") {
  const admin = makeParticipant(adminName || "Admin", true, 0);
  return {
    version: 1,
    code: genCode(),
    title: "Nouvelle rétro",
    createdAt: Date.now(),
    phase: "collecte",
    columns: [
      { id: uid("col"), name: "Mood", emoji: "🌤️", accent: "#F0563B" },
      { id: uid("col"), name: "Technique", emoji: "🛠️", accent: "#2E8B8B" },
    ],
    participants: [admin],
    postits: [],
    currentUserId: admin.id,
    adminId: admin.id,
    timer: { running: false, endsAt: null, durationMin: 5 },
    simulate: false,
  };
}

function genCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const n = "23456789";
  const pick = (s, k) => Array.from({ length: k }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return pick(a, 3) + "-" + pick(n, 3);
}

// Phrases que les coéquipiers simulés peuvent déposer
const SIM_NOTES = {
  Mood: [
    "J'ai adoré le format des dailies plus courts cette semaine",
    "Un peu de pression sur la deadline mais bien géré collectivement",
    "Content du télétravail mieux réparti ce sprint",
  ],
  Technique: [
    "Penser à nettoyer les vieilles feature flags",
    "Le monitoring nous a sauvés sur l'incident de mardi",
    "Trop de context-switching entre les tickets",
    "Super refacto du module auth, beaucoup plus lisible",
  ],
};

// Pseudos rigolos pré-remplis pour rejoindre sans donner son vrai nom
const FUNNY_NAMES = [
  "Licorne Agile", "Panda du Sprint", "Capitaine Refacto", "Ninja du Backlog",
  "Yéti Furtif", "Pingouin Pressé", "Hibou Nocturne", "Renard Malin",
  "Koala Zen", "Dauphin Debuggeur", "Tortue Ninja", "Loutre Givrée",
  "Castor Pragmatique", "Raton du Code", "Marmotte du Lundi", "Écureuil Caféiné",
  "Hérisson Speed", "Pieuvre Multitâche", "Mouette Rieuse", "Wombat Stoïque",
  "Furet Furtif", "Lama Tranquille", "Blaireau Tenace", "Chouette du Vendredi",
];
function randomFunny(exclude) {
  let n; let guard = 0;
  do { n = FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)]; guard++; }
  while (n === exclude && guard < 8);
  return n;
}

// Petites célébrations à l'arrivée d'un participant
const JOIN_EMOJIS = ["🎉", "🎊", "🥳", "🪩", "🎈", "✨", "🌟", "🎁", "🪅", "🚀", "🎯", "🌈"];
const JOIN_LINES = [
  "vient de débarquer",
  "rejoint la fête",
  "s'invite à la rétro",
  "fait une entrée fracassante",
  "arrive en mode ninja",
  "se pose tranquillement",
  "déboule avec le café",
  "rejoint l'aventure",
  "s'incruste avec joie",
  "monte sur scène",
];
const joinEmoji = () => JOIN_EMOJIS[Math.floor(Math.random() * JOIN_EMOJIS.length)];
const joinLine  = () => JOIN_LINES[Math.floor(Math.random() * JOIN_LINES.length)];

Object.assign(window, {
  POSTIT_COLORS, AVATAR_COLORS, SIM_NOTES, FUNNY_NAMES, randomFunny,
  JOIN_EMOJIS, JOIN_LINES, joinEmoji, joinLine,
  makeDemoSession, makeFreshSession, genCode, uid, tiltFor, makeParticipant,
});
