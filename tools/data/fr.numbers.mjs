// Answer-space theme : la clé est un nombre écrit en toutes lettres, l'élément est un fait dénombrable.
// Seules les questions élément -> clé sont générées, donc chaque option et chaque réponse est un mot-nombre.
// Chaque élément commence par une consonne : le gabarit place {v} juste après « de », l'élision (d'ailes,
// d'heures, d'années) casserait la phrase.
export default {
  lang: 'fr',
  theme: 'Nombres et faits',
  seed: 71404,
  keyQuestions: 0,
  templates: {
    item: [
      'Combien y a-t-il de {v} ?',
      'Quel est le nombre de {v} ?',
      'Combien compte-t-on de {v} ?',
      'Quel est le total de {v} ?',
      'Combien peut-on compter de {v} ?',
    ],
  },
  groups: [
    ['deux', "roues d'une bicyclette", "mi-temps dans un match de football", "chaînes dans une molécule d'ADN", "pôles d'un aimant", "poumons chez un être humain", "mains chez une personne", "jambes chez une personne", "genoux chez un être humain"],
    ['trois', "couleurs d'un feu de signalisation", "cordes d'une balalaïka", "guerriers sur le tableau de Vasnetsov", "mois d'été", "couleurs du drapeau de la Russie", "coordonnées d'un point dans l'espace"],
    ['quatre', "saisons de l'année", "roues d'une voiture", "points cardinaux sur une boussole", "pattes d'un chat", "côtés d'un carré", "couleurs d'un jeu de cartes classique", "cordes d'un ukulélé"],
    ['cinq', "doigts d'une main", "jours ouvrés dans une semaine", "cercles du drapeau olympique", "bras d'une étoile de mer", "joueurs d'une équipe de basket-ball sur le terrain", "doigts d'un pied"],
    ['six', "cordes d'une guitare classique", "faces d'un cube", "pattes chez un insecte", "faces d'un dé à jouer", "joueurs d'une équipe de volley-ball", "pattes d'une fourmi", "joueurs d'une équipe de hockey sur glace"],
    ['sept', "jours d'une semaine", "couleurs de l'arc-en-ciel", "notes d'une octave", "merveilles du monde antique", "nains dans le conte de Blanche-Neige"],
    ['huit', "pattes d'une araignée", "planètes du Système solaire", "tentacules d'une pieuvre", "bits dans un octet", "cases d'une rangée d'un échiquier", "pattes d'un scorpion"],
    ['neuf', "symphonies de Beethoven", "muses du Parnasse", "cercles de l'Enfer chez Dante", "joueurs d'une équipe de base-ball sur le terrain"],
    ['dix', "doigts des deux mains", "commandements de la Bible", "quilles au bowling", "millimètres dans un centimètre", "doigts des deux pieds"],
    ['douze', "mois d'une année", "signes du zodiaque", "pouces dans un pied", "travaux d'Hercule", "chiffres d'un cadran d'horloge", "tribus d'Israël", "mois du calendrier"],
    ['quinze', "minutes dans un quart d'heure", "républiques de l'Union soviétique", "boules rouges au snooker"],
    ['vingt', "doigts et orteils chez une personne", "tours du Kremlin de Moscou", "minutes dans un tiers d'heure", "faces d'un icosaèdre", "dents de lait chez un enfant"],
    ['vingt-quatre', "périodes d'une heure dans une journée", "lettres de l'alphabet grec", "carats de l'or pur"],
    ['trente', "jours d'avril", "jours de juin", "jours de septembre", "jours de novembre", "secondes dans une demi-minute"],
    ['trente et un', "jours de janvier", "jours de mars", "jours de mai", "jours de juillet", "jours d'août", "jours d'octobre", "jours de décembre"],
    ['trente-deux', "dents chez un adulte", "pièces sur un échiquier au début d'une partie", "sonates pour piano de Beethoven", "degrés Fahrenheit à la congélation de l'eau"],
    ['quarante', "voleurs dans le conte d'Ali Baba", "semaines d'une grossesse humaine", "jours de pluie lors du Déluge"],
    ['cinquante-deux', "cartes d'un jeu standard", "semaines dans une année", "touches blanches d'un piano"],
    ['cent', "millimètres dans un décimètre", "grammes dans un hectogramme", "litres dans un hectolitre", "kilogrammes dans un quintal"],
    ['mille', "mètres dans un kilomètre", "grammes dans un kilogramme", "millilitres dans un litre", "millimètres dans un mètre", "micromètres dans un millimètre"],
    ['cent quatre-vingts', "degrés d'un angle plat", "degrés dans la somme des angles d'un triangle", "minutes dans trois heures"],
  ],
};
