// Tema de espacio de respuestas: la clave es un número escrito con letras, el elemento es un hecho contable.
// Solo se generan preguntas elemento -> clave, así que cada opción y cada respuesta es una palabra-número.
// Las plantillas no dependen del género del elemento («el número de ...», «la cantidad de ...», «al contar ...»),
// porque los elementos mezclan masculinos y femeninos.
export default {
  lang: 'es',
  theme: 'Números y datos',
  seed: 71405,
  keyQuestions: 0,
  templates: {
    item: [
      '¿Cuál es el número de {v}?',
      '¿Cuál es la cantidad de {v}?',
      '¿Qué número se obtiene al contar {v}?',
      '¿Qué cifra resulta del recuento de {v}?',
      '¿Qué número da el total de {v}?',
    ],
  },
  groups: [
    ['dos', 'ruedas de una bicicleta', 'tiempos de un partido de fútbol', 'cadenas de una molécula de ADN', 'polos de un imán', 'pulmones en un ser humano', 'manos en una persona', 'piernas en una persona', 'rodillas en un ser humano'],
    ['tres', 'colores de un semáforo', 'cuerdas de una balalaika', 'jinetes en el cuadro de Vasnetsov', 'meses del verano', 'colores de la bandera de Rusia', 'coordenadas de un punto en el espacio'],
    ['cuatro', 'estaciones del año', 'ruedas de un coche', 'puntos cardinales de una brújula', 'patas de un gato', 'lados de un cuadrado', 'palos de una baraja de cartas', 'cuerdas de un ukelele'],
    ['cinco', 'dedos de una mano', 'días laborables de una semana', 'anillos de la bandera olímpica', 'brazos de una estrella de mar', 'jugadores de un equipo de baloncesto en la cancha', 'dedos de un pie'],
    ['seis', 'cuerdas de una guitarra clásica', 'caras de un cubo', 'patas de un insecto', 'caras de un dado', 'jugadores de un equipo de voleibol', 'patas de una hormiga'],
    ['siete', 'días de una semana', 'colores del arco iris', 'notas de una octava', 'maravillas del mundo antiguo', 'enanos del cuento de Blancanieves'],
    ['ocho', 'patas de una araña', 'planetas del sistema solar', 'tentáculos de un pulpo', 'bits de un byte', 'casillas de una fila de un tablero de ajedrez', 'patas de un escorpión'],
    ['nueve', 'sinfonías de Beethoven', 'musas del Parnaso', 'círculos del infierno de Dante', 'jugadores de un equipo de béisbol en el campo'],
    ['diez', 'dedos de las dos manos', 'mandamientos de la Biblia', 'bolos del juego de bolos', 'milímetros de un centímetro', 'dedos de los dos pies'],
    ['doce', 'meses de un año', 'signos del zodiaco', 'pulgadas de un pie', 'trabajos de Hércules', 'horas marcadas en un reloj de agujas', 'tribus de Israel', 'meses del calendario'],
    ['quince', 'minutos de un cuarto de hora', 'repúblicas de la Unión Soviética', 'bolas rojas del snooker'],
    ['veinte', 'dedos de las manos y de los pies en una persona', 'torres del Kremlin de Moscú', 'minutos de un tercio de hora', 'caras de un icosaedro', 'dientes de leche de un niño'],
    ['veinticuatro', 'horas de un día', 'letras del alfabeto griego', 'fotogramas por segundo en el cine'],
    ['treinta', 'días de abril', 'días de junio', 'días de septiembre', 'días de noviembre', 'segundos de medio minuto'],
    ['treinta y uno', 'días de enero', 'días de marzo', 'días de mayo', 'días de julio', 'días de agosto', 'días de octubre', 'días de diciembre'],
    ['treinta y dos', 'dientes de un adulto', 'piezas de un tablero de ajedrez al inicio de la partida', 'sonatas para piano de Beethoven', 'grados Fahrenheit a los que se congela el agua'],
    ['cuarenta', 'ladrones del cuento de Alí Babá', 'semanas de un embarazo humano', 'días de lluvia durante el Diluvio'],
    ['cincuenta y dos', 'cartas de una baraja estándar', 'semanas de un año', 'teclas blancas de un piano'],
    ['cien', 'milímetros de un decímetro', 'gramos de un hectogramo', 'litros de un hectolitro', 'kilos de un quintal'],
    ['mil', 'metros de un kilómetro', 'gramos de un kilogramo', 'litros de un metro cúbico', 'gramos de un litro de agua', 'vatios de un kilovatio'],
    ['ciento ochenta', 'grados de un ángulo llano', 'grados de la suma de los ángulos de un triángulo', 'minutos de tres horas'],
  ],
};
