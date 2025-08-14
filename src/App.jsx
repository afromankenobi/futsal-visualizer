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
// description, a sequence of coaching cues with definitions and a
// simplified path describing how the balón should move. The path is
// expressed in percentage coordinates relative to the field container.
const DRILLS = [
  {
    id: 'activation',
    name: 'Activación y coordinación',
    duration: 10,
    description:
      'Juego de ladrón de colas con balones: cada uno conduce su balón protegiéndolo y tratando de quitar la “cola” del compañero.',
    cues: [
      {
        keyword: 'Postura atlética',
        description:
          'Mantén las rodillas flexionadas y el centro de gravedad bajo para moverte con rapidez.'
      },
      {
        keyword: 'Cabeza arriba',
        description:
          'Levanta la vista constantemente para evitar choques y anticipar el movimiento de los demás.'
      },
      {
        keyword: 'Pasos cortos',
        description:
          'Da pasos pequeños para frenar y arrancar sin perder el control del balón.'
      }
    ],
    // Define a square path for el balón to illustrate movimiento libre.
    path: [
      { x: 10, y: 10 },
      { x: 80, y: 10 },
      { x: 80, y: 80 },
      { x: 10, y: 80 }
    ]
  },
  {
    id: 'pases',
    name: 'Técnica de pase',
    duration: 15,
    description:
      'Secuencia de pases en parejas y patrón en Y. Control orientado, pie de apoyo al objetivo.',
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
    // Y‑shaped path: base → centro → vértice → centro.
    path: [
      { x: 10, y: 90 },
      { x: 50, y: 50 },
      { x: 90, y: 10 },
      { x: 50, y: 50 }
    ]
  },
  {
    id: 'rondo',
    name: 'Rondo 4v2',
    duration: 15,
    description:
      'Juego de posesión en cuadrado. Trabaja triángulos, tercer hombre y limitación de toques.',
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
    // Rectangular path around los cuatro vértices del rondo.
    path: [
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 }
    ]
  },
  {
    id: 'posicion',
    name: 'Juego de posición 4v4+3',
    duration: 20,
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
    ]
  },
  {
    id: 'finalizacion',
    name: 'Finalización y precisión',
    duration: 20,
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
    ]
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

  const currentDrill = DRILLS[currentDrillIndex];
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
                      markerWidth="4"
                      markerHeight="4"
                      refX="0"
                      refY="2"
                      orient="auto"
                    >
                      <path d="M0 0 L4 2 L0 4 z" fill="white" />
                    </marker>
                  </defs>
                  <polyline
                    points={pathString}
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                  />
                </svg>
              )}
              {/* Balón */}
              <motion.div
                className="absolute w-4 h-4 bg-white rounded-full shadow-lg"
                animate={{
                  left: `${currentPath[ballPosIndex].x}%`,
                  top: `${currentPath[ballPosIndex].y}%`
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              />
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
                {DRILLS.map((d, idx) => (
                  <option key={d.id} value={idx}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm">Vuelta completas (pases): {passes}</p>
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