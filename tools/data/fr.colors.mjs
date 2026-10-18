// Données sources pour data/fr/colors.json — les couleurs et les choses dont la couleur est
// canonique. L'espace des réponses est la liste des noms de couleurs : seules les questions
// « chose -> couleur » sont générées, donc chaque option et chaque réponse est un nom de couleur.
export default {
  lang: 'fr',
  theme: 'Couleurs',
  seed: 71604,
  keyQuestions: 0,
  templates: {
    item: [
      'De quelle couleur est {v} ?',
      'Quelle couleur a {v} ?',
      'Quelle couleur vient à l\'esprit pour {v} ?',
      '{v} est de quelle couleur ?',
      'De quelle couleur décrit-on {v} ?',
      'Quelle couleur évoque pour vous {v} ?',
    ],
  },
  groups: [
    ['rouge', 'le sang', 'le coquelicot', 'le rubis', "l'amanite tue-mouche", 'la tomate mûre', 'le camion de pompiers', 'la fraise mûre', 'la cerise mûre', 'la framboise', 'le sirop de grenadine'],
    ['orange', 'la carotte', 'la citrouille', 'la mandarine mûre', 'le jus de carotte', 'le cône de signalisation', 'le ballon de basket', 'la papaye mûre', 'le gilet de sauvetage', "l'abricot mûr"],
    ['jaune', 'le citron mûr', 'le soleil', 'le poussin', 'la banane', 'le pissenlit', "l'épi de maïs", 'le tournesol', 'la moutarde', 'le canari', 'le miel'],
    ['vert', "l'herbe au printemps", 'le concombre', 'la sauterelle', 'le petit pois', "l'aiguille de pin", "l'avocat", 'le trèfle', 'le brocoli', 'la feuille de menthe', "l'épinard"],
    ['bleu', 'le ciel clair en journée', 'le myosotis', 'le saphir', 'la myrtille', "l'encre d'un stylo", 'le jean', "l'océan", 'le lapis-lazuli', 'la Méditerranée'],
    ['violet', "l'aubergine", 'la prune mûre', "l'améthyste", 'la lavande', "l'iris", 'le crocus'],
    ['blanc', 'le lait', 'la neige fraîche', 'le sucre', 'le cygne', 'la craie', 'le nuage par beau temps', 'la marguerite', 'le sel de cuisine', 'la farine de blé', 'le riz cuit'],
    ['noir', 'le charbon', 'la suie', 'le corbeau', 'la nuit sans lune', 'la panthère', 'le goudron', 'le pneu de voiture', 'le jais', 'le pétrole brut'],
    ['marron', 'le chocolat', 'le café moulu', "l'écorce du chêne", 'la châtaigne', 'la boue après la pluie', 'la poudre de cacao', 'le pain complet', 'le gland', 'le bouchon de liège', 'la cannelle'],
    ['gris', 'la cendre', "l'éléphant", 'la souris', 'le nuage de pluie', 'le béton', "l'asphalte mouillé", "la fumée d'un feu de camp", 'le pigeon', 'le ciment', 'le loup'],
    ['rose', 'le flamant', 'le cochon', 'la fleur de cerisier', "le pétale de l'églantier", 'la barbe à papa', 'la pivoine'],
    ['turquoise', "l'eau d'un lagon tropical", "l'eau peu profonde d'un atoll", 'la mer au-dessus du récif de corail', "l'eau de la mer des Caraïbes"],
  ],
};
