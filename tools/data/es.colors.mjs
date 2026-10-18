// Datos de origen para data/es/colors.json — los colores y las cosas cuyo color es canónico.
// El espacio de respuestas es la lista de nombres de colores: solo se generan las preguntas
// «cosa -> color», así que cada opción y cada respuesta es un nombre de color.
export default {
  lang: 'es',
  theme: 'Colores',
  seed: 71605,
  keyQuestions: 0,
  templates: {
    item: [
      '¿De qué color es {v}?',
      '¿Qué color tiene {v}?',
      '¿De qué color suele ser {v}?',
      '{v}, ¿de qué color es?',
      '¿De qué color dirías que es {v}?',
      '¿Qué color dirías que tiene {v}?',
    ],
  },
  groups: [
    ['rojo', 'la sangre', 'la amapola', 'el rubí', 'la amanita', 'el tomate maduro', 'el camión de bomberos', 'la fresa madura', 'la cereza madura', 'la frambuesa', 'el pimentón molido'],
    ['naranja', 'la zanahoria', 'la calabaza', 'la mandarina madura', 'el zumo de zanahoria', 'el cono de señalización', 'el balón de baloncesto', 'la papaya madura', 'el chaleco salvavidas', 'el albaricoque maduro'],
    ['amarillo', 'el limón maduro', 'el sol', 'el pollito', 'el plátano', 'el diente de león', 'la mazorca de maíz', 'el girasol', 'la mostaza', 'el canario', 'la miel'],
    ['verde', 'la hierba en primavera', 'el pepino', 'el saltamontes', 'el guisante', 'la aguja de pino', 'el aguacate', 'el trébol', 'el brócoli', 'la hoja de menta', 'la espinaca'],
    ['azul', 'el cielo despejado', 'la nomeolvides', 'el zafiro', 'el arándano', 'la tinta de un bolígrafo', 'el pantalón vaquero', 'el océano', 'el lapislázuli', 'el Mediterráneo'],
    ['violeta', 'la berenjena', 'la ciruela madura', 'la amatista', 'la lavanda', 'la buganvilla', 'el cardo'],
    ['blanco', 'la leche', 'la nieve fresca', 'el azúcar', 'el cisne', 'la tiza', 'la nube en un día claro', 'la margarita', 'la sal de cocina', 'la harina de trigo', 'el arroz cocido'],
    ['negro', 'el carbón', 'el hollín', 'el cuervo', 'la noche sin luna', 'la pantera', 'el alquitrán', 'el neumático del coche', 'el petróleo crudo', 'el azabache'],
    ['marrón', 'el chocolate', 'el café molido', 'la corteza del roble', 'la castaña', 'el barro tras la lluvia', 'el cacao en polvo', 'el pan integral', 'la bellota', 'el corcho', 'la canela'],
    ['gris', 'la ceniza', 'el elefante', 'el ratón', 'la nube de lluvia', 'el hormigón', 'el asfalto mojado', 'el humo de una hoguera', 'la paloma', 'el cemento', 'el lobo'],
    ['rosa', 'el flamenco', 'el cerdo', 'la flor del cerezo', 'el pétalo del escaramujo', 'el algodón de azúcar', 'la peonía'],
    ['turquesa', 'el agua de una laguna tropical', 'el agua poco profunda de un atolón', 'el mar sobre un arrecife de coral', 'el agua del mar Caribe'],
  ],
};
