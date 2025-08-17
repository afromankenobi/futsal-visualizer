import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowRight,
  Boxes,
  X,
  Users,
  Dice6
} from 'lucide-react';

/*
 * This component implements an interactive visualizer for a baby fútbol
 * (futsal) training session. Coaches can select different drills,
 * visualize player and balón movement on a small pitch, toggle helpful
 * overlays (arrow paths and simple 3D perspective), randomize teams and
 * training difficulties, and expose quick definitions of coaching cues.
 *
 * The application is designed to run as a static site and can be
 * deployed to GitHub Pages or any other static hosting service. It uses
 * TailwindCSS for styling, framer-motion for simple animations and
 * lucide-react for crisp icons.
 */

// Data describing each training drill. Each drill includes a name,
// description, a sequence of coaching cues with definitions, ball path,
// player positions, skill level, and optional obstacles. Coordinates are
// expressed in percentage relative to the field container.
const DRILLS = [
  {
    id: 'activation',
    name: 'Activación y coordinación (Ladrón de colas)',
    duration: 10,
    level: 1,
    description: 'Cada jugador conduce su propio balón mientras intenta tocar/quitar la "cola" (cinta) de otros jugadores sin perder su balón.',
    exerciseDescription: 'PREPARACIÓN: Cada jugador con un balón y una cinta/cola en la parte trasera del pantalón. OBJETIVO: Proteger tu balón y tu cola mientras intentas tocar las colas de otros. REGLAS: Si pierdes tu cola, haces 5 flexiones y vuelves al juego.',
    cues: [
      {
        keyword: 'Balón pegado',
        description: 'Mantén el balón muy cerca de tus pies para controlarlo mientras te mueves.'
      },
      {
        keyword: 'Visión periférica',
        description: 'Usa tu visión lateral para ver a otros jugadores mientras proteges tu cola.'  
      },
      {
        keyword: 'Cambios de ritmo',
        description: 'Alterna entre movimientos lentos y explosivos para desorientar a los rivales.'
      }
    ],
    // Multiple paths to show different players with their balls
    path: [
      { x: 15, y: 15 },
      { x: 25, y: 35 },
      { x: 45, y: 25 },
      { x: 35, y: 45 }
    ],
    // Multiple balls - each player has their own ball
    multipleBalls: [
      [
        { x: 15, y: 15 },
        { x: 75, y: 15 },
        { x: 75, y: 75 },
        { x: 15, y: 75 },
        { x: 45, y: 45 }
      ],
      [
        { x: 25, y: 35 },
        { x: 65, y: 25 },
        { x: 65, y: 65 },
        { x: 25, y: 65 },
        { x: 55, y: 35 }
      ],
      [
        { x: 45, y: 25 },
        { x: 75, y: 45 },
        { x: 55, y: 75 },
        { x: 35, y: 55 },
        { x: 65, y: 45 }
      ],
      [
        { x: 35, y: 45 },
        { x: 85, y: 35 },
        { x: 75, y: 85 },
        { x: 15, y: 55 },
        { x: 45, y: 65 }
      ]
    ],
    players: [
      [
        { x: 15, y: 15, team: 'A', number: 1 },
        { x: 75, y: 15, team: 'A', number: 2 },
        { x: 75, y: 75, team: 'A', number: 3 },
        { x: 15, y: 75, team: 'A', number: 4 },
        { x: 45, y: 45, team: 'A', number: 5 }
      ],
      [
        { x: 25, y: 35, team: 'A', number: 1 },
        { x: 65, y: 25, team: 'A', number: 2 },
        { x: 65, y: 65, team: 'A', number: 3 },
        { x: 25, y: 65, team: 'A', number: 4 },
        { x: 55, y: 35, team: 'A', number: 5 }
      ],
      [
        { x: 45, y: 25, team: 'A', number: 1 },
        { x: 75, y: 45, team: 'A', number: 2 },
        { x: 55, y: 75, team: 'A', number: 3 },
        { x: 35, y: 55, team: 'A', number: 4 },
        { x: 65, y: 45, team: 'A', number: 5 }
      ],
      [
        { x: 35, y: 45, team: 'A', number: 1 },
        { x: 85, y: 35, team: 'A', number: 2 },
        { x: 75, y: 85, team: 'A', number: 3 },
        { x: 15, y: 55, team: 'A', number: 4 },
        { x: 45, y: 65, team: 'A', number: 5 }
      ]
    ],
    obstacles: []
  },
  {
    id: 'pases',
    name: 'Técnica de pase',
    duration: 15,
    level: 2,
    description:
      'Secuencia de pases en parejas y patrón en Y. Control orientado, pie de apoyo al objetivo.',
    exerciseDescription: 'PREPARACIÓN: 3 jugadores en forma de Y, distancia de 8-10m entre cada uno. SECUENCIA: A pasa a B, B controla orientado y pasa a C, C devuelve a A. PROGRESIÓN: Añadir limitación de toques (2-1-2), cambiar direcciones.',
    cues: [
      {
        keyword: 'Perfil semiabierto',
        description:
          'Coloca el pie de apoyo apuntando al objetivo y abre el cuerpo ligeramente para recibir y pasar.'
      },
      {
        keyword: 'Mira‑elige‑arma',
        description:
          'Observa a tu compañero, decide a dónde irá el pase y prepara el gesto técnico antes de tocar el balón.'
      },
      {
        keyword: 'Control orientado',
        description:
          'Con el primer toque orienta el balón hacia tu siguiente acción, evitando controles estáticos.'
      }
    ],
    // Y‑shaped path: A → B → C → A (Y formation).
    path: [
      { x: 20, y: 85 },
      { x: 50, y: 40 },
      { x: 80, y: 15 },
      { x: 20, y: 85 }
    ],
    players: [
      [
        { x: 20, y: 85, team: 'A', number: 'A' },
        { x: 50, y: 40, team: 'A', number: 'B' },
        { x: 80, y: 15, team: 'A', number: 'C' }
      ],
      [
        { x: 20, y: 85, team: 'A', number: 'A' },
        { x: 50, y: 40, team: 'A', number: 'B' },
        { x: 80, y: 15, team: 'A', number: 'C' }
      ],
      [
        { x: 20, y: 85, team: 'A', number: 'A' },
        { x: 50, y: 40, team: 'A', number: 'B' },
        { x: 80, y: 15, team: 'A', number: 'C' }
      ],
      [
        { x: 20, y: 85, team: 'A', number: 'A' },
        { x: 50, y: 40, team: 'A', number: 'B' },
        { x: 80, y: 15, team: 'A', number: 'C' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'rondo',
    name: 'Rondo 4v2',
    duration: 15,
    level: 3,
    description:
      'Juego de posesión en cuadrado. Trabaja triángulos, tercer hombre y limitación de toques.',
    exerciseDescription: 'PREPARACIÓN: 4 jugadores en las esquinas de un cuadrado de 12x12m, 2 defensores en el centro. OBJETIVO: Los 4 externos mantienen posesión con máximo 2 toques. ROTACIÓN: Los defensores rotan cada 60 segundos o tras 8 pases consecutivos.',
    cues: [
      {
        keyword: 'Ángulos de apoyo',
        description:
          'Ubica tu cuerpo a 45° respecto del balón para ofrecer siempre una línea de pase clara.'
      },
      {
        keyword: 'Perfilado',
        description:
          'Coloca el ombligo entre el balón y tu siguiente objetivo para facilitar el movimiento posterior.'
      },
      {
        keyword: 'Pasa y muévete',
        description: 'No te quedes parado después de pasar; busca un nuevo espacio inmediatamente.'
      }
    ],
    // Ball moves between the 4 outside players in possession.
    path: [
      { x: 15, y: 15 },
      { x: 85, y: 15 },
      { x: 85, y: 85 },
      { x: 15, y: 85 }
    ],
    players: [
      [
        { x: 15, y: 15, team: 'A', number: '1' },
        { x: 85, y: 15, team: 'A', number: '2' },
        { x: 85, y: 85, team: 'A', number: '3' },
        { x: 15, y: 85, team: 'A', number: '4' },
        { x: 40, y: 40, team: 'B', number: 'D1' },
        { x: 60, y: 60, team: 'B', number: 'D2' }
      ],
      [
        { x: 15, y: 15, team: 'A', number: '1' },
        { x: 85, y: 15, team: 'A', number: '2' },
        { x: 85, y: 85, team: 'A', number: '3' },
        { x: 15, y: 85, team: 'A', number: '4' },
        { x: 50, y: 30, team: 'B', number: 'D1' },
        { x: 50, y: 70, team: 'B', number: 'D2' }
      ],
      [
        { x: 15, y: 15, team: 'A', number: '1' },
        { x: 85, y: 15, team: 'A', number: '2' },
        { x: 85, y: 85, team: 'A', number: '3' },
        { x: 15, y: 85, team: 'A', number: '4' },
        { x: 60, y: 40, team: 'B', number: 'D1' },
        { x: 40, y: 60, team: 'B', number: 'D2' }
      ],
      [
        { x: 15, y: 15, team: 'A', number: '1' },
        { x: 85, y: 15, team: 'A', number: '2' },
        { x: 85, y: 85, team: 'A', number: '3' },
        { x: 15, y: 85, team: 'A', number: '4' },
        { x: 35, y: 55, team: 'B', number: 'D1' },
        { x: 65, y: 45, team: 'B', number: 'D2' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'posicion',
    name: 'Juego de posición 4v4+3',
    duration: 20,
    level: 4,
    description:
      'Posicionamiento: amplitud, profundidad, doble línea de pase y cambio de orientación.',
    cues: [
      {
        keyword: 'Ancho‑profundo‑corto',
        description:
          'Mantén amplitud lateral, un apoyo en profundidad y una opción corta cerca del balón.'
      },
      {
        keyword: 'Abrirse para recibir',
        description:
          'Desmárcate abriendo tu cuerpo y alejándote del rival para facilitar la recepción.'
      },
      {
        keyword: 'Cerrar para finalizar',
        description:
          'Cuando la jugada se acerca al área, acércate para tener ángulos de tiro o pase rápido.'
      }
    ],
    // Hexagonal path para simular cambios de orientación.
    path: [
      { x: 10, y: 50 },
      { x: 30, y: 10 },
      { x: 70, y: 10 },
      { x: 90, y: 50 },
      { x: 70, y: 90 },
      { x: 30, y: 90 }
    ],
    players: [
      [
        { x: 15, y: 45, team: 'A', number: 1 },
        { x: 25, y: 15, team: 'A', number: 2 },
        { x: 65, y: 15, team: 'A', number: 3 },
        { x: 85, y: 45, team: 'A', number: 4 },
        { x: 65, y: 85, team: 'B', number: 5 },
        { x: 35, y: 85, team: 'B', number: 6 },
        { x: 50, y: 30, team: 'N', number: 7 },
        { x: 50, y: 50, team: 'N', number: 8 },
        { x: 50, y: 70, team: 'N', number: 9 }
      ],
      [
        { x: 20, y: 50, team: 'A', number: 1 },
        { x: 30, y: 20, team: 'A', number: 2 },
        { x: 70, y: 20, team: 'A', number: 3 },
        { x: 80, y: 50, team: 'A', number: 4 },
        { x: 70, y: 80, team: 'B', number: 5 },
        { x: 30, y: 80, team: 'B', number: 6 },
        { x: 45, y: 35, team: 'N', number: 7 },
        { x: 55, y: 45, team: 'N', number: 8 },
        { x: 45, y: 65, team: 'N', number: 9 }
      ],
      [
        { x: 15, y: 55, team: 'A', number: 1 },
        { x: 35, y: 15, team: 'A', number: 2 },
        { x: 75, y: 15, team: 'A', number: 3 },
        { x: 85, y: 55, team: 'A', number: 4 },
        { x: 75, y: 85, team: 'B', number: 5 },
        { x: 25, y: 85, team: 'B', number: 6 },
        { x: 50, y: 25, team: 'N', number: 7 },
        { x: 60, y: 50, team: 'N', number: 8 },
        { x: 40, y: 75, team: 'N', number: 9 }
      ],
      [
        { x: 20, y: 50, team: 'A', number: 1 },
        { x: 30, y: 10, team: 'A', number: 2 },
        { x: 70, y: 10, team: 'A', number: 3 },
        { x: 90, y: 50, team: 'A', number: 4 },
        { x: 70, y: 90, team: 'B', number: 5 },
        { x: 30, y: 90, team: 'B', number: 6 },
        { x: 55, y: 30, team: 'N', number: 7 },
        { x: 50, y: 55, team: 'N', number: 8 },
        { x: 45, y: 70, team: 'N', number: 9 }
      ],
      [
        { x: 15, y: 45, team: 'A', number: 1 },
        { x: 25, y: 15, team: 'A', number: 2 },
        { x: 65, y: 15, team: 'A', number: 3 },
        { x: 85, y: 45, team: 'A', number: 4 },
        { x: 65, y: 85, team: 'B', number: 5 },
        { x: 35, y: 85, team: 'B', number: 6 },
        { x: 50, y: 35, team: 'N', number: 7 },
        { x: 45, y: 50, team: 'N', number: 8 },
        { x: 55, y: 75, team: 'N', number: 9 }
      ],
      [
        { x: 10, y: 50, team: 'A', number: 1 },
        { x: 30, y: 10, team: 'A', number: 2 },
        { x: 70, y: 10, team: 'A', number: 3 },
        { x: 90, y: 50, team: 'A', number: 4 },
        { x: 70, y: 90, team: 'B', number: 5 },
        { x: 30, y: 90, team: 'B', number: 6 },
        { x: 50, y: 30, team: 'N', number: 7 },
        { x: 50, y: 50, team: 'N', number: 8 },
        { x: 50, y: 70, team: 'N', number: 9 }
      ]
    ],
    obstacles: []
  },
  {
    id: 'finalizacion',
    name: 'Finalización y precisión',
    duration: 20,
    level: 5,
    description:
      'Pase de apoyo, pared y tiro a las esquinas. Tiros a dianas para ganar más puntos.',
    cues: [
      {
        keyword: 'Paso lateral final',
        description: 'El último paso antes de chutar debe ser lateral para equilibrar tu cuerpo.'
      },
      {
        keyword: 'Tobillo firme',
        description: 'Fija el tobillo al golpear el balón para lograr un tiro preciso.'
      },
      {
        keyword: 'Mirada al objetivo',
        description: 'Observa la diana (esquina) antes de armar el disparo para orientar mejor el tiro.'
      }
    ],
    // Camino hacia la portería en diagonal.
    path: [
      { x: 10, y: 80 },
      { x: 40, y: 60 },
      { x: 60, y: 60 },
      { x: 90, y: 20 }
    ],
    players: [
      [
        { x: 15, y: 75, team: 'A', number: 1 },
        { x: 35, y: 65, team: 'A', number: 2 },
        { x: 55, y: 65, team: 'A', number: 3 },
        { x: 85, y: 25, team: 'A', number: 4 },
        { x: 25, y: 45, team: 'B', number: 5 },
        { x: 75, y: 45, team: 'B', number: 6 }
      ],
      [
        { x: 20, y: 70, team: 'A', number: 1 },
        { x: 40, y: 60, team: 'A', number: 2 },
        { x: 60, y: 60, team: 'A', number: 3 },
        { x: 80, y: 30, team: 'A', number: 4 },
        { x: 30, y: 50, team: 'B', number: 5 },
        { x: 70, y: 40, team: 'B', number: 6 }
      ],
      [
        { x: 15, y: 75, team: 'A', number: 1 },
        { x: 45, y: 55, team: 'A', number: 2 },
        { x: 65, y: 55, team: 'A', number: 3 },
        { x: 85, y: 25, team: 'A', number: 4 },
        { x: 25, y: 40, team: 'B', number: 5 },
        { x: 75, y: 50, team: 'B', number: 6 }
      ],
      [
        { x: 10, y: 80, team: 'A', number: 1 },
        { x: 40, y: 60, team: 'A', number: 2 },
        { x: 60, y: 60, team: 'A', number: 3 },
        { x: 90, y: 20, team: 'A', number: 4 },
        { x: 30, y: 45, team: 'B', number: 5 },
        { x: 70, y: 45, team: 'B', number: 6 }
      ]
    ],
    obstacles: [
      { x: 20, y: 35, type: 'cone' },
      { x: 50, y: 35, type: 'cone' },
      { x: 80, y: 10, type: 'goal' }
    ]
  },
  {
    id: 'conduccion_basica',
    name: 'Conducción básica',
    duration: 8,
    level: 1,
    description: 'Conducción libre con ambos pies, cambios de dirección y paradas.',
    exerciseDescription: 'PREPARACIÓN: Cada jugador con balón en un área de 15x15m con conos dispersos. OBJETIVO: Conducir libremente evitando conos y otros jugadores, usando ambos pies. PROGRESIÓN: Añadir señales del entrenador (cambio de dirección, parada, etc.).',
    cues: [
      {
        keyword: 'Contacto suave',
        description: 'Mantén el balón cerca con toques ligeros, sin golpearlo fuerte.'
      },
      {
        keyword: 'Ambos pies',
        description: 'Alterna entre pie derecho e izquierdo para mejorar la coordinación.'
      },
      {
        keyword: 'Cabeza arriba',
        description: 'Mira hacia adelante mientras conduces para mantener la visión de juego.'
      }
    ],
    path: [
      { x: 10, y: 50 },
      { x: 30, y: 30 },
      { x: 50, y: 70 },
      { x: 70, y: 20 },
      { x: 90, y: 50 }
    ],
    players: [
      [{ x: 15, y: 45, team: 'A', number: 1 }],
      [{ x: 25, y: 35, team: 'A', number: 1 }],
      [{ x: 45, y: 65, team: 'A', number: 1 }],
      [{ x: 65, y: 25, team: 'A', number: 1 }],
      [{ x: 85, y: 45, team: 'A', number: 1 }]
    ],
    obstacles: [
      { x: 25, y: 50, type: 'cone' },
      { x: 45, y: 30, type: 'cone' },
      { x: 65, y: 70, type: 'cone' }
    ]
  },
  {
    id: 'pase_pared',
    name: 'Pase y pared',
    duration: 12,
    level: 2,
    description: 'Jugador 1 pasa al Jugador 2 (pared), quien devuelve a un toque mientras Jugador 1 se mueve.',
    exerciseDescription: 'PREPARACIÓN: Jugador 1 con balón, Jugador 2 como pared fija. SECUENCIA: 1) Pase al pie del pared, 2) Pared devuelve a un toque, 3) Jugador 1 recibe en movimiento. CLAVE: El pared NO controla, solo redirige de primera.',
    cues: [
      {
        keyword: 'Pase al pie',
        description: 'El primer pase debe llegar exactamente al pie del compañero pared.'
      },
      {
        keyword: 'Un toque',
        description: 'El pared devuelve de primera sin controlar el balón.'
      },
      {
        keyword: 'Sincronización',
        description: 'Inicia tu carrera justo cuando haces el pase inicial al pared.'
      }
    ],
    path: [
      { x: 20, y: 50 },
      { x: 45, y: 50 },
      { x: 45, y: 30 },
      { x: 75, y: 30 }
    ],
    players: [
      [
        { x: 25, y: 45, team: 'A', number: 'A' },
        { x: 45, y: 55, team: 'A', number: 'B' }
      ],
      [
        { x: 30, y: 45, team: 'A', number: 'A' },
        { x: 45, y: 55, team: 'A', number: 'B' }
      ],
      [
        { x: 40, y: 35, team: 'A', number: 'A' },
        { x: 45, y: 55, team: 'A', number: 'B' }
      ],
      [
        { x: 70, y: 35, team: 'A', number: 'A' },
        { x: 45, y: 55, team: 'A', number: 'B' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'triangulacion',
    name: 'Triangulación 3v1',
    duration: 15,
    level: 3,
    description: 'Tres jugadores mantienen posesión contra uno, trabajando triángulos de pase.',
    cues: [
      {
        keyword: 'Triángulos',
        description: 'Forma triángulos para siempre tener dos opciones de pase disponibles.'
      },
      {
        keyword: 'Movilidad',
        description: 'Muévete constantemente para ofrecer líneas de pase limpias.'
      },
      {
        keyword: 'Paciencia',
        description: 'No fuerces pases arriesgados, espera la oportunidad correcta.'
      }
    ],
    path: [
      { x: 20, y: 70 },
      { x: 50, y: 20 },
      { x: 80, y: 70 },
      { x: 20, y: 70 }
    ],
    players: [
      [
        { x: 20, y: 70, team: 'A', number: 'A' },
        { x: 50, y: 20, team: 'A', number: 'B' },
        { x: 80, y: 70, team: 'A', number: 'C' },
        { x: 50, y: 55, team: 'B', number: 'D' }
      ],
      [
        { x: 20, y: 70, team: 'A', number: 'A' },
        { x: 50, y: 20, team: 'A', number: 'B' },
        { x: 80, y: 70, team: 'A', number: 'C' },
        { x: 40, y: 45, team: 'B', number: 'D' }
      ],
      [
        { x: 20, y: 70, team: 'A', number: 'A' },
        { x: 50, y: 20, team: 'A', number: 'B' },
        { x: 80, y: 70, team: 'A', number: 'C' },
        { x: 60, y: 45, team: 'B', number: 'D' }
      ],
      [
        { x: 20, y: 70, team: 'A', number: 'A' },
        { x: 50, y: 20, team: 'A', number: 'B' },
        { x: 80, y: 70, team: 'A', number: 'C' },
        { x: 50, y: 60, team: 'B', number: 'D' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'pressing_coordinado',
    name: 'Pressing coordinado',
    duration: 18,
    level: 4,
    description: 'Los atacantes mantienen posesión mientras los defensores practican presión coordinada sin ganar el balón.',
    exerciseDescription: 'PREPARACIÓN: 3 atacantes con balón vs 2 defensores. OBJETIVO: Defensores practican movimientos coordinados para cerrar espacios sin ganar posesión. CLAVE: Los defensores se mueven como bloque pero NO interceptan el balón.',
    cues: [
      {
        keyword: 'Presión escalonada',
        description: 'El primer defensor presiona al balón, el segundo cubre espacios, mantiene distancia.'
      },
      {
        keyword: 'Comunicación',
        description: 'Los defensores hablan constantemente para coordinar sus movimientos.'
      },
      {
        keyword: 'Sin interceptar',
        description: 'El objetivo es posicionarse correctamente, NO ganar el balón.'
      }
    ],
    // Ball stays with attackers - they keep possession throughout
    path: [
      { x: 20, y: 20 },
      { x: 40, y: 30 },
      { x: 60, y: 20 },
      { x: 40, y: 30 }
    ],
    players: [
      [
        { x: 25, y: 25, team: 'A', number: 'A1' },
        { x: 35, y: 35, team: 'A', number: 'A2' },
        { x: 55, y: 25, team: 'A', number: 'A3' },
        { x: 45, y: 50, team: 'B', number: 'D1' },
        { x: 65, y: 40, team: 'B', number: 'D2' }
      ],
      [
        { x: 25, y: 25, team: 'A', number: 'A1' },
        { x: 40, y: 30, team: 'A', number: 'A2' },
        { x: 55, y: 25, team: 'A', number: 'A3' },
        { x: 50, y: 45, team: 'B', number: 'D1' },
        { x: 60, y: 35, team: 'B', number: 'D2' }
      ],
      [
        { x: 25, y: 25, team: 'A', number: 'A1' },
        { x: 35, y: 35, team: 'A', number: 'A2' },
        { x: 60, y: 20, team: 'A', number: 'A3' },
        { x: 45, y: 40, team: 'B', number: 'D1' },
        { x: 70, y: 30, team: 'B', number: 'D2' }
      ],
      [
        { x: 25, y: 25, team: 'A', number: 'A1' },
        { x: 40, y: 30, team: 'A', number: 'A2' },
        { x: 55, y: 25, team: 'A', number: 'A3' },
        { x: 50, y: 45, team: 'B', number: 'D1' },
        { x: 60, y: 35, team: 'B', number: 'D2' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'transicion_ofensiva',
    name: 'Transición ofensiva',
    duration: 20,
    level: 5,
    description: 'Recuperación de balón y transición rápida al ataque con superioridad numérica.',
    cues: [
      {
        keyword: 'Velocidad mental',
        description: 'Piensa rápido después de recuperar el balón, busca el pase más directo.'
      },
      {
        keyword: 'Profundidad',
        description: 'Busca inmediatamente jugadores en posiciones avanzadas.'
      },
      {
        keyword: 'Amplitud',
        description: 'Usa todo el ancho del campo para estirar la defensa rival.'
      }
    ],
    path: [
      { x: 20, y: 70 },
      { x: 40, y: 50 },
      { x: 60, y: 30 },
      { x: 80, y: 15 }
    ],
    players: [
      [
        { x: 25, y: 65, team: 'A', number: 1 },
        { x: 15, y: 45, team: 'A', number: 2 },
        { x: 35, y: 35, team: 'A', number: 3 },
        { x: 55, y: 25, team: 'A', number: 4 },
        { x: 45, y: 60, team: 'B', number: 5 },
        { x: 65, y: 50, team: 'B', number: 6 }
      ],
      [
        { x: 30, y: 60, team: 'A', number: 1 },
        { x: 20, y: 40, team: 'A', number: 2 },
        { x: 40, y: 45, team: 'A', number: 3 },
        { x: 60, y: 35, team: 'A', number: 4 },
        { x: 50, y: 65, team: 'B', number: 5 },
        { x: 70, y: 45, team: 'B', number: 6 }
      ],
      [
        { x: 35, y: 55, team: 'A', number: 1 },
        { x: 25, y: 35, team: 'A', number: 2 },
        { x: 55, y: 35, team: 'A', number: 3 },
        { x: 65, y: 25, team: 'A', number: 4 },
        { x: 45, y: 55, team: 'B', number: 5 },
        { x: 75, y: 40, team: 'B', number: 6 }
      ],
      [
        { x: 40, y: 50, team: 'A', number: 1 },
        { x: 30, y: 30, team: 'A', number: 2 },
        { x: 70, y: 25, team: 'A', number: 3 },
        { x: 75, y: 20, team: 'A', number: 4 },
        { x: 50, y: 45, team: 'B', number: 5 },
        { x: 65, y: 35, team: 'B', number: 6 }
      ]
    ],
    obstacles: [
      { x: 30, y: 60, type: 'cone' },
      { x: 50, y: 40, type: 'cone' }
    ]
  },
  // LEVEL 1 - More basic exercises
  {
    id: 'malabarismo_basico',
    name: 'Malabarismo básico',
    duration: 10,
    level: 1,
    description: 'Toques con pie, muslo y cabeza. Coordinación individual con balón.',
    exerciseDescription: 'PREPARACIÓN: Cada jugador con balón en espacio personal. SECUENCIA: 1) Solo pies (5 toques), 2) Pie-muslo (alternado), 3) Pie-muslo-cabeza. PROGRESIÓN: Aumentar número de toques consecutivos.',
    cues: [
      {
        keyword: 'Superficie correcta',
        description: 'Usa el empeine para toques suaves y controlados.'
      },
      {
        keyword: 'Ritmo constante',
        description: 'Mantén un ritmo pausado y controlado, sin prisa.'
      },
      {
        keyword: 'Posición equilibrada',
        description: 'Mantén el equilibrio con brazos extendidos.'
      }
    ],
    path: [
      { x: 50, y: 50 },
      { x: 50, y: 45 },
      { x: 50, y: 55 },
      { x: 50, y: 50 }
    ],
    players: [
      [{ x: 50, y: 50, team: 'A', number: 'A' }],
      [{ x: 50, y: 45, team: 'A', number: 'A' }],
      [{ x: 50, y: 55, team: 'A', number: 'A' }],
      [{ x: 50, y: 50, team: 'A', number: 'A' }]
    ],
    obstacles: []
  },
  {
    id: 'relevos_conduccion',
    name: 'Relevos de conducción',
    duration: 12,
    level: 1,
    description: 'Carreras de relevos conduciendo balón. Competencia por equipos.',
    exerciseDescription: 'PREPARACIÓN: 2 equipos en filas, un balón por equipo. SECUENCIA: Conducir hasta cono, volver y entregar a compañero. OBJETIVO: Primer equipo en completar relevos gana.',
    cues: [
      {
        keyword: 'Velocidad controlada',
        description: 'Conduce rápido pero sin perder el control del balón.'
      },
      {
        keyword: 'Cambio limpio',
        description: 'Entrega el balón directamente al pie del compañero.'
      },
      {
        keyword: 'Apoyo vocal',
        description: 'Anima a tu equipo durante la carrera.'
      }
    ],
    path: [
      { x: 10, y: 80 },
      { x: 90, y: 80 },
      { x: 90, y: 20 },
      { x: 10, y: 20 }
    ],
    players: [
      [
        { x: 15, y: 75, team: 'A', number: 'A1' },
        { x: 15, y: 85, team: 'A', number: 'A2' },
        { x: 15, y: 25, team: 'B', number: 'B1' },
        { x: 15, y: 15, team: 'B', number: 'B2' }
      ],
      [
        { x: 85, y: 75, team: 'A', number: 'A1' },
        { x: 15, y: 85, team: 'A', number: 'A2' },
        { x: 85, y: 25, team: 'B', number: 'B1' },
        { x: 15, y: 15, team: 'B', number: 'B2' }
      ],
      [
        { x: 85, y: 25, team: 'A', number: 'A1' },
        { x: 15, y: 85, team: 'A', number: 'A2' },
        { x: 85, y: 75, team: 'B', number: 'B1' },
        { x: 15, y: 15, team: 'B', number: 'B2' }
      ],
      [
        { x: 15, y: 25, team: 'A', number: 'A1' },
        { x: 15, y: 85, team: 'A', number: 'A2' },
        { x: 15, y: 75, team: 'B', number: 'B1' },
        { x: 15, y: 15, team: 'B', number: 'B2' }
      ]
    ],
    obstacles: [
      { x: 90, y: 80, type: 'cone' },
      { x: 90, y: 20, type: 'cone' }
    ]
  },
  {
    id: 'giros_basicos',
    name: 'Giros básicos con balón',
    duration: 8,
    level: 1,
    description: 'Práctica de giros de 180° con diferentes superficies del pie.',
    exerciseDescription: 'PREPARACIÓN: Jugadores en línea con balones. TÉCNICA: 1) Giro con interior, 2) Giro con exterior, 3) Giro con planta. RITMO: 10 segundos por técnica, después cambiar.',
    cues: [
      {
        keyword: 'Balón protegido',
        description: 'Mantén tu cuerpo entre el balón y el oponente imaginario.'
      },
      {
        keyword: 'Paso de apoyo',
        description: 'Planta el pie de apoyo firme antes del giro.'
      },
      {
        keyword: 'Explosión',
        description: 'Sal del giro con velocidad hacia la nueva dirección.'
      }
    ],
    path: [
      { x: 30, y: 30 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
      { x: 70, y: 30 }
    ],
    players: [
      [{ x: 30, y: 30, team: 'A', number: 'A' }],
      [{ x: 30, y: 70, team: 'A', number: 'A' }],
      [{ x: 70, y: 70, team: 'A', number: 'A' }],
      [{ x: 70, y: 30, team: 'A', number: 'A' }]
    ],
    obstacles: [
      { x: 30, y: 50, type: 'cone' },
      { x: 70, y: 50, type: 'cone' }
    ]
  },
  // LEVEL 2 - More technique-focused exercises
  {
    id: 'control_aereo',
    name: 'Control de balones aéreos',
    duration: 15,
    level: 2,
    description: 'Control orientado de balones lanzados por compañero. Diferentes superficies.',
    exerciseDescription: 'PREPARACIÓN: Parejas a 10m, uno lanza balón alto. TÉCNICA: Control con interior, exterior, pecho, muslo. ROTACIÓN: 10 controles cada uno, después cambiar roles.',
    cues: [
      {
        keyword: 'Lectura temprana',
        description: 'Anticipa la trayectoria del balón desde que sale del pie.'
      },
      {
        keyword: 'Superficie suave',
        description: 'Recibe el balón amortiguando el impacto.'
      },
      {
        keyword: 'Control orientado',
        description: 'Dirige el balón hacia tu próxima acción.'
      }
    ],
    path: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
      { x: 80, y: 30 },
      { x: 20, y: 30 }
    ],
    players: [
      [
        { x: 25, y: 45, team: 'A', number: 'A' },
        { x: 75, y: 55, team: 'A', number: 'B' }
      ],
      [
        { x: 25, y: 45, team: 'A', number: 'A' },
        { x: 75, y: 55, team: 'A', number: 'B' }
      ],
      [
        { x: 25, y: 45, team: 'A', number: 'A' },
        { x: 75, y: 35, team: 'A', number: 'B' }
      ],
      [
        { x: 25, y: 35, team: 'A', number: 'A' },
        { x: 75, y: 35, team: 'A', number: 'B' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'finalización_individual',
    name: 'Finalización individual',
    duration: 18,
    level: 2,
    description: 'Tiros a portería desde diferentes ángulos y distancias.',
    exerciseDescription: 'PREPARACIÓN: Fila de jugadores, portero en meta. SECUENCIA: Recibe pase del entrenador, control y tiro inmediato. VARIANTES: Diferentes ángulos, pierna hábil y menos hábil.',
    cues: [
      {
        keyword: 'Cabeza arriba',
        description: 'Mira la portería antes del tiro para elegir esquina.'
      },
      {
        keyword: 'Pie de apoyo',
        description: 'Planta el pie de apoyo al lado del balón.'
      },
      {
        keyword: 'Seguimiento',
        description: 'Sigue el movimiento completo del pie tras el impacto.'
      }
    ],
    path: [
      { x: 30, y: 80 },
      { x: 50, y: 60 },
      { x: 70, y: 40 },
      { x: 85, y: 20 }
    ],
    players: [
      [
        { x: 35, y: 75, team: 'A', number: 'A' },
        { x: 85, y: 25, team: 'B', number: 'GK' }
      ],
      [
        { x: 45, y: 65, team: 'A', number: 'A' },
        { x: 85, y: 25, team: 'B', number: 'GK' }
      ],
      [
        { x: 65, y: 45, team: 'A', number: 'A' },
        { x: 85, y: 25, team: 'B', number: 'GK' }
      ],
      [
        { x: 80, y: 25, team: 'A', number: 'A' },
        { x: 85, y: 25, team: 'B', number: 'GK' }
      ]
    ],
    obstacles: [
      { x: 85, y: 15, type: 'goal' },
      { x: 85, y: 35, type: 'goal' }
    ]
  },
  // LEVEL 3 - More tactical exercises
  {
    id: 'superioridad_numerica',
    name: 'Superioridad numérica 2v1',
    duration: 12,
    level: 3,
    description: 'Dos atacantes contra un defensor. Decisiones rápidas y colaboración.',
    exerciseDescription: 'PREPARACIÓN: 2 vs 1 en espacio de 15x10m. OBJETIVO: Los dos atacantes deben llegar a línea de fondo. ROTACIÓN: Defensor se cambia cada 3 ataques.',
    cues: [
      {
        keyword: 'Amplitud',
        description: 'Manténganse separados para crear dilema al defensor.'
      },
      {
        keyword: 'Timing',
        description: 'Sincroniza el pase cuando el defensor se compromete.'
      },
      {
        keyword: 'Comunicación',
        description: 'Hablen para coordinar el ataque.'
      }
    ],
    path: [
      { x: 20, y: 20 },
      { x: 50, y: 30 },
      { x: 80, y: 20 },
      { x: 85, y: 15 }
    ],
    players: [
      [
        { x: 25, y: 25, team: 'A', number: 'A1' },
        { x: 25, y: 15, team: 'A', number: 'A2' },
        { x: 60, y: 20, team: 'B', number: 'D' }
      ],
      [
        { x: 45, y: 35, team: 'A', number: 'A1' },
        { x: 35, y: 25, team: 'A', number: 'A2' },
        { x: 65, y: 25, team: 'B', number: 'D' }
      ],
      [
        { x: 75, y: 25, team: 'A', number: 'A1' },
        { x: 65, y: 15, team: 'A', number: 'A2' },
        { x: 70, y: 30, team: 'B', number: 'D' }
      ],
      [
        { x: 80, y: 20, team: 'A', number: 'A1' },
        { x: 75, y: 10, team: 'A', number: 'A2' },
        { x: 85, y: 25, team: 'B', number: 'D' }
      ]
    ],
    obstacles: []
  },
  // LEVEL 4 - More advanced tactical exercises
  {
    id: 'rotaciones_tacticas',
    name: 'Rotaciones tácticas 4v4',
    duration: 20,
    level: 4,
    description: 'Rotaciones coordinadas entre líneas. Movimientos sin balón y ocupación de espacios.',
    exerciseDescription: 'PREPARACIÓN: 4v4 en campo reducido con zonas marcadas. OBJETIVO: Equipo atacante debe rotar posiciones según pautas preestablecidas. REGLA ESPECIAL: No se puede repetir la misma posición dos veces seguidas.',
    cues: [
      {
        keyword: 'Rotación ciega',
        description: 'Rota a tu nueva posición incluso antes de recibir el balón.'
      },
      {
        keyword: 'Timing colectivo',
        description: 'Toda la línea se mueve al mismo tiempo, no individualmente.'
      },
      {
        keyword: 'Ocupación inteligente',
        description: 'Asegúrate de que no queden espacios vacíos tras la rotación.'
      }
    ],
    path: [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 70, y: 70 },
      { x: 30, y: 70 }
    ],
    players: [
      [
        { x: 25, y: 35, team: 'A', number: '1' },
        { x: 65, y: 35, team: 'A', number: '2' },
        { x: 65, y: 65, team: 'A', number: '3' },
        { x: 25, y: 65, team: 'A', number: '4' },
        { x: 45, y: 25, team: 'B', number: 'D1' },
        { x: 55, y: 45, team: 'B', number: 'D2' },
        { x: 45, y: 75, team: 'B', number: 'D3' },
        { x: 35, y: 55, team: 'B', number: 'D4' }
      ],
      [
        { x: 65, y: 35, team: 'A', number: '1' },
        { x: 65, y: 65, team: 'A', number: '2' },
        { x: 25, y: 65, team: 'A', number: '3' },
        { x: 25, y: 35, team: 'A', number: '4' },
        { x: 55, y: 25, team: 'B', number: 'D1' },
        { x: 55, y: 55, team: 'B', number: 'D2' },
        { x: 35, y: 75, team: 'B', number: 'D3' },
        { x: 35, y: 45, team: 'B', number: 'D4' }
      ],
      [
        { x: 65, y: 65, team: 'A', number: '1' },
        { x: 25, y: 65, team: 'A', number: '2' },
        { x: 25, y: 35, team: 'A', number: '3' },
        { x: 65, y: 35, team: 'A', number: '4' },
        { x: 75, y: 55, team: 'B', number: 'D1' },
        { x: 35, y: 75, team: 'B', number: 'D2' },
        { x: 15, y: 45, team: 'B', number: 'D3' },
        { x: 55, y: 25, team: 'B', number: 'D4' }
      ],
      [
        { x: 25, y: 65, team: 'A', number: '1' },
        { x: 25, y: 35, team: 'A', number: '2' },
        { x: 65, y: 35, team: 'A', number: '3' },
        { x: 65, y: 65, team: 'A', number: '4' },
        { x: 35, y: 75, team: 'B', number: 'D1' },
        { x: 15, y: 45, team: 'B', number: 'D2' },
        { x: 55, y: 25, team: 'B', number: 'D3' },
        { x: 75, y: 55, team: 'B', number: 'D4' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'bloque_defensivo',
    name: 'Bloque defensivo líneas',
    duration: 18,
    level: 4,
    description: 'Movimiento coordinado de bloque defensivo con dos líneas. Basculación y cobertura.',
    exerciseDescription: 'PREPARACIÓN: 6 defensores (4+2) vs 5 atacantes. OBJETIVO: Defensores se mueven como bloque, basculando según posición del balón. ENFOQUE: Coordinación entre primera y segunda línea defensiva.',
    cues: [
      {
        keyword: 'Basculación',
        description: 'Todo el bloque se inclina hacia el lado del balón manteniendo distancias.'
      },
      {
        keyword: 'Líneas paralelas',
        description: 'Las dos líneas se mueven paralelas, nunca se rompe la estructura.'
      },
      {
        keyword: 'Pressing escalonado',
        description: 'Primera línea presiona, segunda línea cubre espacios interiores.'
      }
    ],
    path: [
      { x: 80, y: 30 },
      { x: 50, y: 20 },
      { x: 20, y: 30 },
      { x: 50, y: 40 }
    ],
    players: [
      [
        { x: 75, y: 35, team: 'A', number: 'A1' },
        { x: 85, y: 25, team: 'A', number: 'A2' },
        { x: 70, y: 15, team: 'A', number: 'A3' },
        { x: 60, y: 25, team: 'A', number: 'A4' },
        { x: 45, y: 35, team: 'A', number: 'A5' },
        { x: 65, y: 45, team: 'B', number: 'D1' },
        { x: 75, y: 55, team: 'B', number: 'D2' },
        { x: 55, y: 55, team: 'B', number: 'D3' },
        { x: 45, y: 65, team: 'B', number: 'D4' },
        { x: 35, y: 45, team: 'B', number: 'D5' },
        { x: 55, y: 75, team: 'B', number: 'D6' }
      ],
      [
        { x: 55, y: 25, team: 'A', number: 'A1' },
        { x: 45, y: 15, team: 'A', number: 'A2' },
        { x: 40, y: 25, team: 'A', number: 'A3' },
        { x: 60, y: 35, team: 'A', number: 'A4' },
        { x: 70, y: 25, team: 'A', number: 'A5' },
        { x: 45, y: 35, team: 'B', number: 'D1' },
        { x: 35, y: 45, team: 'B', number: 'D2' },
        { x: 55, y: 45, team: 'B', number: 'D3' },
        { x: 65, y: 55, team: 'B', number: 'D4' },
        { x: 75, y: 35, team: 'B', number: 'D5' },
        { x: 45, y: 65, team: 'B', number: 'D6' }
      ],
      [
        { x: 25, y: 35, team: 'A', number: 'A1' },
        { x: 15, y: 25, team: 'A', number: 'A2' },
        { x: 30, y: 15, team: 'A', number: 'A3' },
        { x: 40, y: 25, team: 'A', number: 'A4' },
        { x: 35, y: 45, team: 'A', number: 'A5' },
        { x: 35, y: 45, team: 'B', number: 'D1' },
        { x: 25, y: 55, team: 'B', number: 'D2' },
        { x: 45, y: 55, team: 'B', number: 'D3' },
        { x: 55, y: 65, team: 'B', number: 'D4' },
        { x: 45, y: 35, team: 'B', number: 'D5' },
        { x: 35, y: 75, team: 'B', number: 'D6' }
      ],
      [
        { x: 45, y: 45, team: 'A', number: 'A1' },
        { x: 55, y: 35, team: 'A', number: 'A2' },
        { x: 40, y: 25, team: 'A', number: 'A3' },
        { x: 30, y: 35, team: 'A', number: 'A4' },
        { x: 35, y: 55, team: 'A', number: 'A5' },
        { x: 45, y: 55, team: 'B', number: 'D1' },
        { x: 55, y: 65, team: 'B', number: 'D2' },
        { x: 35, y: 65, team: 'B', number: 'D3' },
        { x: 25, y: 55, team: 'B', number: 'D4' },
        { x: 35, y: 45, team: 'B', number: 'D5' },
        { x: 45, y: 75, team: 'B', number: 'D6' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'contragolpe_organizado',
    name: 'Contragolpe organizado',
    duration: 22,
    level: 4,
    description: 'Transición rápida de defensa a ataque. 3 pases máximo para llegar a área rival.',
    exerciseDescription: 'PREPARACIÓN: Equipo A pierde balón en campo rival, Equipo B recupera. OBJETIVO: B debe llegar al área de A en máximo 3 pases. CONSTRAINT: Todos los jugadores de A deben volver corriendo.',
    cues: [
      {
        keyword: 'Primer pase rápido',
        description: 'Quien recupera pasa inmediatamente hacia adelante, no hacia atrás.'
      },
      {
        keyword: 'Carrera en paralelo',
        description: 'Compañeros corren en paralelo al pase para crear opciones.'
      },
      {
        keyword: 'Tercer pase decisivo',
        description: 'El tercer pase debe ser asistencia o directamente a finalización.'
      }
    ],
    path: [
      { x: 80, y: 50 },
      { x: 50, y: 30 },
      { x: 20, y: 20 },
      { x: 10, y: 15 }
    ],
    players: [
      [
        { x: 75, y: 55, team: 'B', number: 'B1' },
        { x: 65, y: 45, team: 'B', number: 'B2' },
        { x: 55, y: 35, team: 'B', number: 'B3' },
        { x: 45, y: 25, team: 'B', number: 'B4' },
        { x: 70, y: 70, team: 'A', number: 'A1' },
        { x: 60, y: 75, team: 'A', number: 'A2' },
        { x: 50, y: 80, team: 'A', number: 'A3' },
        { x: 40, y: 85, team: 'A', number: 'A4' }
      ],
      [
        { x: 55, y: 35, team: 'B', number: 'B1' },
        { x: 45, y: 25, team: 'B', number: 'B2' },
        { x: 35, y: 15, team: 'B', number: 'B3' },
        { x: 25, y: 25, team: 'B', number: 'B4' },
        { x: 60, y: 60, team: 'A', number: 'A1' },
        { x: 50, y: 65, team: 'A', number: 'A2' },
        { x: 40, y: 70, team: 'A', number: 'A3' },
        { x: 30, y: 75, team: 'A', number: 'A4' }
      ],
      [
        { x: 25, y: 25, team: 'B', number: 'B1' },
        { x: 15, y: 15, team: 'B', number: 'B2' },
        { x: 25, y: 5, team: 'B', number: 'B3' },
        { x: 35, y: 15, team: 'B', number: 'B4' },
        { x: 45, y: 45, team: 'A', number: 'A1' },
        { x: 35, y: 50, team: 'A', number: 'A2' },
        { x: 25, y: 55, team: 'A', number: 'A3' },
        { x: 15, y: 60, team: 'A', number: 'A4' }
      ],
      [
        { x: 15, y: 20, team: 'B', number: 'B1' },
        { x: 5, y: 10, team: 'B', number: 'B2' },
        { x: 15, y: 5, team: 'B', number: 'B3' },
        { x: 25, y: 15, team: 'B', number: 'B4' },
        { x: 35, y: 35, team: 'A', number: 'A1' },
        { x: 25, y: 40, team: 'A', number: 'A2' },
        { x: 15, y: 45, team: 'A', number: 'A3' },
        { x: 10, y: 50, team: 'A', number: 'A4' }
      ]
    ],
    obstacles: [
      { x: 10, y: 10, type: 'goal' },
      { x: 10, y: 20, type: 'goal' }
    ]
  },
  // LEVEL 5 - Expert level exercises
  {
    id: 'superioridad_posicional',
    name: 'Superioridad posicional 5v3+2',
    duration: 25,
    level: 5,
    description: 'Juego posicional complejo: 5 atacantes vs 3 defensores + 2 comodines neutrales.',
    exerciseDescription: 'PREPARACIÓN: 5 azules vs 3 rojos, 2 grises (comodines siempre con posesión). OBJETIVO: 15 pases consecutivos = punto. REGLA: Comodines no pueden pasar entre ellos, solo conectar azules.',
    cues: [
      {
        keyword: 'Paciencia extrema',
        description: 'Mantén posesión hasta encontrar el momento perfecto para atacar.'
      },
      {
        keyword: 'Uso de comodines',
        description: 'Los comodines son para conectar líneas, no para crear juego.'
      },
      {
        keyword: 'Circulación inteligente',
        description: 'Cambia el ritmo de circulación para desequilibrar la defensa.'
      }
    ],
    path: [
      { x: 15, y: 70 },
      { x: 40, y: 20 },
      { x: 70, y: 40 },
      { x: 85, y: 80 },
      { x: 50, y: 90 },
      { x: 20, y: 60 }
    ],
    players: [
      [
        { x: 20, y: 65, team: 'A', number: '1' },
        { x: 35, y: 25, team: 'A', number: '2' },
        { x: 65, y: 45, team: 'A', number: '3' },
        { x: 80, y: 75, team: 'A', number: '4' },
        { x: 45, y: 85, team: 'A', number: '5' },
        { x: 50, y: 40, team: 'B', number: 'D1' },
        { x: 30, y: 60, team: 'B', number: 'D2' },
        { x: 70, y: 65, team: 'B', number: 'D3' },
        { x: 25, y: 35, team: 'N', number: 'C1' },
        { x: 75, y: 25, team: 'N', number: 'C2' }
      ],
      [
        { x: 35, y: 25, team: 'A', number: '1' },
        { x: 65, y: 45, team: 'A', number: '2' },
        { x: 80, y: 75, team: 'A', number: '3' },
        { x: 45, y: 85, team: 'A', number: '4' },
        { x: 25, y: 65, team: 'A', number: '5' },
        { x: 45, y: 35, team: 'B', number: 'D1' },
        { x: 65, y: 60, team: 'B', number: 'D2' },
        { x: 35, y: 75, team: 'B', number: 'D3' },
        { x: 40, y: 25, team: 'N', number: 'C1' },
        { x: 70, y: 40, team: 'N', number: 'C2' }
      ],
      [
        { x: 65, y: 45, team: 'A', number: '1' },
        { x: 80, y: 75, team: 'A', number: '2' },
        { x: 45, y: 85, team: 'A', number: '3' },
        { x: 25, y: 65, team: 'A', number: '4' },
        { x: 35, y: 25, team: 'A', number: '5' },
        { x: 60, y: 50, team: 'B', number: 'D1' },
        { x: 40, y: 70, team: 'B', number: 'D2' },
        { x: 30, y: 40, team: 'B', number: 'D3' },
        { x: 70, y: 40, team: 'N', number: 'C1' },
        { x: 85, y: 80, team: 'N', number: 'C2' }
      ],
      [
        { x: 80, y: 75, team: 'A', number: '1' },
        { x: 45, y: 85, team: 'A', number: '2' },
        { x: 25, y: 65, team: 'A', number: '3' },
        { x: 35, y: 25, team: 'A', number: '4' },
        { x: 65, y: 45, team: 'A', number: '5' },
        { x: 70, y: 60, team: 'B', number: 'D1' },
        { x: 35, y: 70, team: 'B', number: 'D2' },
        { x: 40, y: 35, team: 'B', number: 'D3' },
        { x: 85, y: 80, team: 'N', number: 'C1' },
        { x: 50, y: 90, team: 'N', number: 'C2' }
      ],
      [
        { x: 45, y: 85, team: 'A', number: '1' },
        { x: 25, y: 65, team: 'A', number: '2' },
        { x: 35, y: 25, team: 'A', number: '3' },
        { x: 65, y: 45, team: 'A', number: '4' },
        { x: 80, y: 75, team: 'A', number: '5' },
        { x: 35, y: 75, team: 'B', number: 'D1' },
        { x: 40, y: 40, team: 'B', number: 'D2' },
        { x: 70, y: 55, team: 'B', number: 'D3' },
        { x: 50, y: 90, team: 'N', number: 'C1' },
        { x: 20, y: 60, team: 'N', number: 'C2' }
      ],
      [
        { x: 25, y: 65, team: 'A', number: '1' },
        { x: 35, y: 25, team: 'A', number: '2' },
        { x: 65, y: 45, team: 'A', number: '3' },
        { x: 80, y: 75, team: 'A', number: '4' },
        { x: 45, y: 85, team: 'A', number: '5' },
        { x: 30, y: 55, team: 'B', number: 'D1' },
        { x: 50, y: 35, team: 'B', number: 'D2' },
        { x: 75, y: 60, team: 'B', number: 'D3' },
        { x: 20, y: 60, team: 'N', number: 'C1' },
        { x: 25, y: 35, team: 'N', number: 'C2' }
      ]
    ],
    obstacles: []
  },
  {
    id: 'jugadas_ensayadas',
    name: 'Jugadas ensayadas (saques)',
    duration: 20,
    level: 5,
    description: 'Ejecución de jugadas preestablecidas desde saque de banda y esquina.',
    exerciseDescription: 'PREPARACIÓN: Situaciones de balón parado variadas. REPERTORIO: 4 variantes por tipo de saque. OBJETIVO: Ejecución perfecta con timing y posicionamiento exacto. ROTACIÓN: Todos aprenden todas las posiciones.',
    cues: [
      {
        keyword: 'Sincronización milimétrica',
        description: 'Todos los movimientos deben coordinarse al segundo exacto.'
      },
      {
        keyword: 'Señales discretas',
        description: 'Usa señales para comunicar la variante sin que la defensa se entere.'
      },
      {
        keyword: 'Plan B siempre',
        description: 'Si la jugada se complica, ten siempre una opción de seguridad.'
      }
    ],
    path: [
      { x: 90, y: 50 },
      { x: 70, y: 30 },
      { x: 50, y: 20 },
      { x: 30, y: 30 },
      { x: 15, y: 15 }
    ],
    players: [
      [
        { x: 85, y: 55, team: 'A', number: '1' },
        { x: 75, y: 35, team: 'A', number: '2' },
        { x: 55, y: 25, team: 'A', number: '3' },
        { x: 35, y: 35, team: 'A', number: '4' },
        { x: 20, y: 20, team: 'A', number: '5' },
        { x: 60, y: 40, team: 'B', number: 'D1' },
        { x: 40, y: 50, team: 'B', number: 'D2' },
        { x: 70, y: 60, team: 'B', number: 'D3' },
        { x: 25, y: 45, team: 'B', number: 'D4' }
      ],
      [
        { x: 85, y: 55, team: 'A', number: '1' },
        { x: 70, y: 30, team: 'A', number: '2' },
        { x: 50, y: 20, team: 'A', number: '3' },
        { x: 30, y: 30, team: 'A', number: '4' },
        { x: 15, y: 15, team: 'A', number: '5' },
        { x: 65, y: 45, team: 'B', number: 'D1' },
        { x: 45, y: 35, team: 'B', number: 'D2' },
        { x: 35, y: 55, team: 'B', number: 'D3' },
        { x: 20, y: 40, team: 'B', number: 'D4' }
      ],
      [
        { x: 85, y: 55, team: 'A', number: '1' },
        { x: 65, y: 25, team: 'A', number: '2' },
        { x: 45, y: 15, team: 'A', number: '3' },
        { x: 25, y: 25, team: 'A', number: '4' },
        { x: 10, y: 10, team: 'A', number: '5' },
        { x: 70, y: 40, team: 'B', number: 'D1' },
        { x: 50, y: 30, team: 'B', number: 'D2' },
        { x: 30, y: 45, team: 'B', number: 'D3' },
        { x: 15, y: 35, team: 'B', number: 'D4' }
      ],
      [
        { x: 85, y: 55, team: 'A', number: '1' },
        { x: 70, y: 30, team: 'A', number: '2' },
        { x: 50, y: 20, team: 'A', number: '3' },
        { x: 30, y: 30, team: 'A', number: '4' },
        { x: 15, y: 15, team: 'A', number: '5' },
        { x: 65, y: 50, team: 'B', number: 'D1' },
        { x: 45, y: 40, team: 'B', number: 'D2' },
        { x: 25, y: 50, team: 'B', number: 'D3' },
        { x: 10, y: 30, team: 'B', number: 'D4' }
      ],
      [
        { x: 85, y: 55, team: 'A', number: '1' },
        { x: 70, y: 30, team: 'A', number: '2' },
        { x: 50, y: 20, team: 'A', number: '3' },
        { x: 30, y: 30, team: 'A', number: '4' },
        { x: 15, y: 15, team: 'A', number: '5' },
        { x: 60, y: 45, team: 'B', number: 'D1' },
        { x: 40, y: 35, team: 'B', number: 'D2' },
        { x: 20, y: 45, team: 'B', number: 'D3' },
        { x: 5, y: 25, team: 'B', number: 'D4' }
      ]
    ],
    obstacles: [
      { x: 15, y: 10, type: 'goal' },
      { x: 15, y: 20, type: 'goal' }
    ]
  },
  {
    id: 'pressing_ultra_alto',
    name: 'Pressing ultra alto coordinado',
    duration: 25,
    level: 5,
    description: 'Pressing inmediato tras pérdida en campo rival. Recuperación en 4 segundos.',
    exerciseDescription: 'PREPARACIÓN: 6v6 en campo completo. REGLA: Tras perder balón, tienes 4 segundos para recuperar o el rival anota automáticamente. OBJETIVO: Pressing inmediato, coordinado, ultra intenso.',
    cues: [
      {
        keyword: 'Pressing inmediato',
        description: 'En el momento de perder el balón, todos presionan instantáneamente.'
      },
      {
        keyword: 'Cerco colectivo',
        description: 'Rodea al portador del balón con 3 jugadores, corta todas las salidas.'
      },
      {
        keyword: 'Intensidad máxima',
        description: 'Los 4 segundos requieren la máxima intensidad física y mental.'
      }
    ],
    path: [
      { x: 20, y: 30 },
      { x: 10, y: 40 },
      { x: 15, y: 55 },
      { x: 25, y: 45 }
    ],
    players: [
      [
        { x: 25, y: 25, team: 'B', number: 'B1' },
        { x: 15, y: 35, team: 'B', number: 'B2' },
        { x: 35, y: 35, team: 'B', number: 'B3' },
        { x: 45, y: 25, team: 'B', number: 'B4' },
        { x: 55, y: 35, team: 'B', number: 'B5' },
        { x: 65, y: 25, team: 'B', number: 'B6' },
        { x: 15, y: 45, team: 'A', number: 'A1' },
        { x: 25, y: 55, team: 'A', number: 'A2' },
        { x: 35, y: 65, team: 'A', number: 'A3' },
        { x: 45, y: 55, team: 'A', number: 'A4' },
        { x: 55, y: 65, team: 'A', number: 'A5' },
        { x: 65, y: 55, team: 'A', number: 'A6' }
      ],
      [
        { x: 15, y: 35, team: 'B', number: 'B1' },
        { x: 5, y: 45, team: 'B', number: 'B2' },
        { x: 25, y: 45, team: 'B', number: 'B3' },
        { x: 35, y: 35, team: 'B', number: 'B4' },
        { x: 45, y: 45, team: 'B', number: 'B5' },
        { x: 55, y: 35, team: 'B', number: 'B6' },
        { x: 10, y: 40, team: 'A', number: 'A1' },
        { x: 20, y: 50, team: 'A', number: 'A2' },
        { x: 30, y: 60, team: 'A', number: 'A3' },
        { x: 40, y: 50, team: 'A', number: 'A4' },
        { x: 50, y: 60, team: 'A', number: 'A5' },
        { x: 60, y: 50, team: 'A', number: 'A6' }
      ],
      [
        { x: 20, y: 50, team: 'B', number: 'B1' },
        { x: 10, y: 60, team: 'B', number: 'B2' },
        { x: 30, y: 60, team: 'B', number: 'B3' },
        { x: 25, y: 40, team: 'B', number: 'B4' },
        { x: 35, y: 50, team: 'B', number: 'B5' },
        { x: 45, y: 40, team: 'B', number: 'B6' },
        { x: 15, y: 55, team: 'A', number: 'A1' },
        { x: 25, y: 65, team: 'A', number: 'A2' },
        { x: 35, y: 75, team: 'A', number: 'A3' },
        { x: 30, y: 45, team: 'A', number: 'A4' },
        { x: 40, y: 55, team: 'A', number: 'A5' },
        { x: 50, y: 45, team: 'A', number: 'A6' }
      ],
      [
        { x: 30, y: 40, team: 'B', number: 'B1' },
        { x: 20, y: 50, team: 'B', number: 'B2' },
        { x: 40, y: 50, team: 'B', number: 'B3' },
        { x: 15, y: 35, team: 'B', number: 'B4' },
        { x: 25, y: 45, team: 'B', number: 'B5' },
        { x: 35, y: 35, team: 'B', number: 'B6' },
        { x: 25, y: 45, team: 'A', number: 'A1' },
        { x: 35, y: 55, team: 'A', number: 'A2' },
        { x: 45, y: 65, team: 'A', number: 'A3' },
        { x: 20, y: 40, team: 'A', number: 'A4' },
        { x: 30, y: 50, team: 'A', number: 'A5' },
        { x: 40, y: 40, team: 'A', number: 'A6' }
      ]
    ],
    obstacles: []
  }
];

// Lista de posibles condiciones o dificultades a aplicar durante el
// partido condicionado. Estas saldrán al azar al pulsar el botón de
// "Tirar dado". Puedes ampliar esta lista según tu creatividad.
const DIFFICULTIES = [
  {
    id: 'light_ball',
    name: 'Balón liviano',
    description: 'Usa un balón de goma‑espuma, más ligero y difícil de controlar.'
  },
  {
    id: 'heavy_ball',
    name: 'Balón pesado',
    description: 'Usa un balón con peso extra (agua o arena) para trabajar fuerza y control.'
  },
  {
    id: 'no_crosses',
    name: 'Sin centros',
    description: 'No se permiten centros altos, solo pases rasos y paredes.'
  },
  {
    id: 'small_area_shots',
    name: 'Solo tiros desde el área chica',
    description: 'Los goles solo cuentan si el tiro se realiza dentro de la media luna.'
  },
  {
    id: 'two_touches',
    name: 'Máximo dos toques',
    description: 'Cada jugador dispone de un máximo de dos toques antes de pasar.'
  },
  {
    id: 'ankle_weights',
    name: 'Pesas en tobillos',
    description: 'Algunos jugadores colocan pesas ligeras en los tobillos para trabajar fuerza.'
  }
];

// El componente principal de la aplicación.
export default function App() {
  // Índice del drill actualmente seleccionado.
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  // Controla si la animación del balón está en marcha.
  const [isPlaying, setIsPlaying] = useState(false);
  // Muestra u oculta las flechas de pase.
  const [showArrows, setShowArrows] = useState(true);
  // Activa o desactiva la perspectiva 3D ligera.
  const [show3D, setShow3D] = useState(false);
  // Guarda la cue actualmente mostrada en el tooltip.
  const [tooltip, setTooltip] = useState(null);
  // Índice de posición del balón en la ruta del drill.
  const [ballPosIndex, setBallPosIndex] = useState(0);
  // Conteo de pases completados. Se incrementa cada vez que el balón
  // completa una vuelta sobre su ruta.
  const [passes, setPasses] = useState(0);
  // Resultado de la última tirada de dado para dificultades.
  const [diceResult, setDiceResult] = useState(null);
  // Filtro de nivel de habilidad (1-5)
  const [levelFilter, setLevelFilter] = useState(0); // 0 = todos los niveles

  const filteredDrills = levelFilter === 0 ? DRILLS : DRILLS.filter(d => d.level === levelFilter);
  const currentDrill = filteredDrills[currentDrillIndex] || DRILLS[0];
  const currentPath = currentDrill.path;

  // Efecto que actualiza la posición del balón automáticamente cuando
  // isPlaying es true. Se ejecuta cada segundo y reinicia la posición al
  // principio cuando llega al final del path. Al completar una vuelta
  // entera se incrementa el conteo de pases.
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setBallPosIndex((i) => {
          const next = (i + 1) % currentPath.length;
          if (next === 0) {
            setPasses((p) => p + 1);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPath]);

  // Lanza el dado y selecciona una dificultad al azar.
  const rollDice = () => {
    const idx = Math.floor(Math.random() * DIFFICULTIES.length);
    setDiceResult(DIFFICULTIES[idx]);
  };

  // Construye la cadena de puntos para la polilínea del SVG. Se usa un
  // porcentaje para cada coordenada, lo cual permite que la ruta escale
  // con el tamaño del contenedor.
  const pathString = currentPath.map((pos) => `${pos.x},${pos.y}`).join(' ');

  return (
    <div className="min-h-screen p-4 bg-neutral-950 text-white flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Sesión de baby fútbol</h1>
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Panel principal con el campo, controles y cues */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Campo de juego */}
          <div
            className="relative border border-neutral-700 rounded-xl overflow-hidden"
            style={{
              perspective: show3D ? '1000px' : undefined
            }}
          >
            <div
              className={`relative w-full h-96 bg-green-700/70 rounded-xl`}
              style={
                show3D
                  ? {
                      transform: 'rotateX(25deg) skewY(-10deg)',
                      transformOrigin: 'center top'
                    }
                  : {}
              }
            >
              {/* Flechas de pase */}
              {showArrows && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id="arrow"
                      markerWidth="3"
                      markerHeight="3"
                      refX="0"
                      refY="1.5"
                      orient="auto"
                    >
                      <path d="M0 0 L3 1.5 L0 3 z" fill="white" />
                    </marker>
                  </defs>
                  <polyline
                    points={pathString}
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    markerEnd="url(#arrow)"
                  />
                </svg>
              )}
              {/* Jugadores */}
              {currentDrill.players && currentDrill.players[ballPosIndex] && 
                currentDrill.players[ballPosIndex].map((player, idx) => (
                  <motion.div
                    key={`${player.team}-${player.number}`}
                    className={`absolute w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-xs font-bold ${
                      player.team === 'A' 
                        ? 'bg-blue-500 text-white' 
                        : player.team === 'B' 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-400 text-black'
                    }`}
                    animate={{
                      left: `${player.x}%`,
                      top: `${player.y}%`
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                  >
                    {player.number}
                  </motion.div>
                ))
              }
              
              {/* Obstáculos */}
              {currentDrill.obstacles && currentDrill.obstacles.map((obstacle, idx) => (
                <div
                  key={idx}
                  className={`absolute ${
                    obstacle.type === 'cone' 
                      ? 'w-3 h-3 bg-orange-400 rounded-full' 
                      : obstacle.type === 'goal'
                      ? 'w-8 h-6 border-2 border-white bg-transparent'
                      : 'w-4 h-4 bg-gray-500 rounded'
                  }`}
                  style={{
                    left: `${obstacle.x}%`,
                    top: `${obstacle.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              
              {/* Balón/Balones */}
              {currentDrill.multipleBalls ? (
                // Multiple balls for exercises like "Ladrón de colas"
                currentDrill.multipleBalls[ballPosIndex] && 
                currentDrill.multipleBalls[ballPosIndex].map((ball, idx) => (
                  <motion.div
                    key={`ball-${idx}`}
                    className="absolute w-3 h-3 bg-white rounded-full shadow-lg border border-gray-300"
                    animate={{
                      left: `${ball.x}%`,
                      top: `${ball.y}%`
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                  />
                ))
              ) : (
                // Single ball for regular exercises
                <motion.div
                  className="absolute w-4 h-4 bg-white rounded-full shadow-lg"
                  animate={{
                    left: `${currentPath[ballPosIndex].x}%`,
                    top: `${currentPath[ballPosIndex].y}%`
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                />
              )}
            </div>
          </div>
          {/* Controles debajo del campo */}
          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded hover:bg-neutral-700"
              onClick={() => setIsPlaying((p) => !p)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pausar' : 'Play'}
            </button>
            <button
              className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded hover:bg-neutral-700"
              onClick={() => setShowArrows((s) => !s)}
            >
              <ArrowRight size={16} /> {showArrows ? 'Ocultar flechas' : 'Mostrar flechas'}
            </button>
            <button
              className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded hover:bg-neutral-700"
              onClick={() => setShow3D((s) => !s)}
            >
              <Boxes size={16} /> {show3D ? 'Modo 2D' : 'Modo 3D'}
            </button>
          </div>
          {/* Información del drill y cues */}
          <div>
            <h3 className="text-xl font-semibold">{currentDrill.name}</h3>
            <p className="text-sm text-neutral-400 mb-2">
              {currentDrill.description}
            </p>
            {currentDrill.exerciseDescription && (
              <div className="bg-neutral-800 p-3 rounded-lg mb-3">
                <h4 className="text-sm font-semibold text-yellow-400 mb-1">Instrucciones del ejercicio:</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {currentDrill.exerciseDescription}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {currentDrill.cues.map((cue, idx) => (
                <button
                  key={idx}
                  className="bg-neutral-800 px-2 py-1 rounded hover:bg-neutral-700 text-sm"
                  onClick={() => setTooltip(tooltip && tooltip.keyword === cue.keyword ? null : cue)}
                >
                  {cue.keyword}
                </button>
              ))}
            </div>
            {tooltip && (
              <div className="relative">
                <div className="absolute z-10 bg-neutral-800 p-3 rounded shadow-xl w-64">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{tooltip.keyword}</span>
                    <button
                      onClick={() => setTooltip(null)}
                      aria-label="Cerrar tooltip"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-neutral-300">{tooltip.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Panel lateral con selectores, randomizador y dado */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="bg-neutral-800 p-4 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Configuración de drill</h2>
            <div className="mb-3">
              <label className="block text-sm mb-1" htmlFor="level-filter">
                Filtrar por nivel
              </label>
              <select
                id="level-filter"
                className="w-full bg-neutral-700 p-2 rounded mb-3"
                value={levelFilter}
                onChange={(e) => {
                  const level = Number(e.target.value);
                  setLevelFilter(level);
                  setCurrentDrillIndex(0);
                  setBallPosIndex(0);
                  setPasses(0);
                  setTooltip(null);
                }}
              >
                <option value={0}>Todos los niveles</option>
                <option value={1}>Nivel 1 - Principiante</option>
                <option value={2}>Nivel 2 - Básico</option>
                <option value={3}>Nivel 3 - Intermedio</option>
                <option value={4}>Nivel 4 - Avanzado</option>
                <option value={5}>Nivel 5 - Experto</option>
              </select>
              <label className="block text-sm mb-1" htmlFor="drill-select">
                Selecciona un drill
              </label>
              <select
                id="drill-select"
                className="w-full bg-neutral-700 p-2 rounded"
                value={currentDrillIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setCurrentDrillIndex(idx);
                  setBallPosIndex(0);
                  setPasses(0);
                  setTooltip(null);
                }}
              >
                {filteredDrills.map((d, idx) => (
                  <option key={d.id} value={idx}>
                    Nivel {d.level} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Vueltas completas: {passes}</span>
              <span className="text-blue-400">Nivel {currentDrill.level}</span>
            </div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Randomizador de equipos</h2>
            <TeamRandomizer />
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Dado de dificultades</h2>
            <button
              onClick={rollDice}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded"
            >
              <Dice6 size={16} /> Tirar dado
            </button>
            {diceResult && (
              <div className="mt-3">
                <p className="font-semibold text-sm">{diceResult.name}</p>
                <p className="text-xs text-neutral-300">{diceResult.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * Componente auxiliar para randomizar equipos a partir de una lista de
 * nombres introducida por el usuario. Los nombres deben separarse por
 * comas. Al pulsar “Randomizar” se divide la lista en dos equipos de
 * tamaño similar. Si hay un número impar de jugadores el primer
 * equipo tendrá un jugador extra.
 */
function TeamRandomizer() {
  const [input, setInput] = useState('');
  const [teams, setTeams] = useState(null);

  const randomize = () => {
    const players = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (players.length === 0) {
      setTeams(null);
      return;
    }
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const midpoint = Math.ceil(shuffled.length / 2);
    setTeams({
      A: shuffled.slice(0, midpoint),
      B: shuffled.slice(midpoint)
    });
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ingresa nombres separados por coma"
        className="w-full bg-neutral-700 p-2 rounded text-sm mb-2 h-20 resize-none"
      />
      <button
        onClick={randomize}
        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded"
      >
        Randomizar
      </button>
      {teams && (
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">Equipo A</p>
            <ul className="list-disc list-inside">
              {teams.A.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Equipo B</p>
            <ul className="list-disc list-inside">
              {teams.B.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}