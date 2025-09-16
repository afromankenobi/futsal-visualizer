import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowRight,
  Boxes,
  X,
  Users,
  Dice6,
  Save,
  ChevronDown,
  Plus,
  Trash2,
  Edit3
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
      { x: 20, y: 25 },
      { x: 70, y: 25 },
      { x: 70, y: 75 },
      { x: 20, y: 75 }
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
      { x: 25, y: 80 },
      { x: 50, y: 50 },
      { x: 75, y: 20 },
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
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 75, y: 75 },
      { x: 25, y: 75 }
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
      { x: 20, y: 50 },
      { x: 35, y: 25 },
      { x: 65, y: 25 },
      { x: 80, y: 50 },
      { x: 65, y: 75 },
      { x: 35, y: 75 }
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
      { x: 25, y: 75 },
      { x: 45, y: 60 },
      { x: 65, y: 45 },
      { x: 80, y: 30 }
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

// Workshop management functions
const getWorkshops = () => {
  try {
    const workshops = localStorage.getItem('futsal-workshops');
    return workshops ? JSON.parse(workshops) : [];
  } catch (e) {
    return [];
  }
};

const saveWorkshop = (workshop) => {
  try {
    const workshops = getWorkshops();
    const existingIndex = workshops.findIndex(w => w.id === workshop.id);

    if (existingIndex >= 0) {
      workshops[existingIndex] = workshop;
    } else {
      workshops.push(workshop);
    }

    localStorage.setItem('futsal-workshops', JSON.stringify(workshops));
    return workshop;
  } catch (e) {
    console.error('Error saving workshop:', e);
    return null;
  }
};

const deleteWorkshop = (id) => {
  try {
    const workshops = getWorkshops();
    const filtered = workshops.filter(w => w.id !== id);
    localStorage.setItem('futsal-workshops', JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting workshop:', e);
    return false;
  }
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

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

  // Workshop management state
  const [currentWorkshop, setCurrentWorkshop] = useState(null);
  const [showWorkshopDropdown, setShowWorkshopDropdown] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newWorkshopName, setNewWorkshopName] = useState('');

  const currentDrill = DRILLS[currentDrillIndex];
  const currentPath = currentDrill.path;

  // Load workshops on mount
  useEffect(() => {
    setWorkshops(getWorkshops());
  }, []);

  // Track changes for unsaved state
  useEffect(() => {
    if (currentWorkshop) {
      setHasUnsavedChanges(true);
    }
  }, [currentDrillIndex, diceResult]);

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

  // Workshop functions
  const createWorkshop = (name) => {
    const workshop = {
      id: generateId(),
      name: name.trim(),
      drillIndex: currentDrillIndex,
      difficulty: diceResult,
      created: new Date().toISOString()
    };

    const saved = saveWorkshop(workshop);
    if (saved) {
      setCurrentWorkshop(saved);
      setWorkshops(getWorkshops());
      setHasUnsavedChanges(false);
    }
    return saved;
  };

  const loadWorkshop = (workshop) => {
    setCurrentWorkshop(workshop);
    setCurrentDrillIndex(workshop.drillIndex);
    setDiceResult(workshop.difficulty);
    setBallPosIndex(0);
    setPasses(0);
    setTooltip(null);
    setHasUnsavedChanges(false);
  };

  const saveCurrentWorkshop = () => {
    if (currentWorkshop) {
      const updated = {
        ...currentWorkshop,
        drillIndex: currentDrillIndex,
        difficulty: diceResult,
        updated: new Date().toISOString()
      };

      const saved = saveWorkshop(updated);
      if (saved) {
        setCurrentWorkshop(saved);
        setHasUnsavedChanges(false);
      }
    }
  };

  const deleteCurrentWorkshop = () => {
    if (currentWorkshop && deleteWorkshop(currentWorkshop.id)) {
      setCurrentWorkshop(null);
      setWorkshops(getWorkshops());
      setHasUnsavedChanges(false);
    }
  };

  // Lanza el dado y selecciona una dificultad al azar.
  const rollDice = () => {
    const idx = Math.floor(Math.random() * DIFFICULTIES.length);
    setDiceResult(DIFFICULTIES[idx]);
  };

  // Construye la cadena de puntos para la polilínea del SVG. Se usa un
  // porcentaje para cada coordenada, lo cual permite que la ruta escale
  // con el tamaño del contenedor.
  const pathString = currentPath.map((pos) => `${pos.x},${pos.y}`).join(' ');

  const getWorkshopDisplayName = () => {
    if (!currentWorkshop) return 'Sin guardar';
    return currentWorkshop.name + (hasUnsavedChanges ? '*' : '');
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Futsal Trainer</h1>

          {/* Workshop Selector */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 hover:bg-neutral-700 transition-colors"
              onClick={() => setShowWorkshopDropdown(!showWorkshopDropdown)}
            >
              <span className="text-sm font-medium">
                {getWorkshopDisplayName()}
              </span>
              <ChevronDown size={16} />
            </button>

            {/* Workshop Dropdown */}
            {showWorkshopDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-neutral-700">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    onClick={() => {
                      setShowSaveDialog(true);
                      setShowWorkshopDropdown(false);
                    }}
                  >
                    <Plus size={16} />
                    Nuevo workshop
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {workshops.length === 0 ? (
                    <div className="p-4 text-center text-neutral-400 text-sm">
                      No hay workshops guardados
                    </div>
                  ) : (
                    workshops.map((workshop) => (
                      <div
                        key={workshop.id}
                        className={`flex items-center justify-between p-3 hover:bg-neutral-700 border-b border-neutral-700/50 ${
                          currentWorkshop?.id === workshop.id ? 'bg-neutral-700' : ''
                        }`}
                      >
                        <button
                          className="flex-1 text-left text-sm"
                          onClick={() => {
                            loadWorkshop(workshop);
                            setShowWorkshopDropdown(false);
                          }}
                        >
                          <div className="font-medium">{workshop.name}</div>
                          <div className="text-xs text-neutral-400">
                            {DRILLS[workshop.drillIndex]?.name}
                          </div>
                        </button>

                        {currentWorkshop?.id === workshop.id && (
                          <button
                            className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                            onClick={() => {
                              if (confirm('¿Eliminar este workshop?')) {
                                deleteCurrentWorkshop();
                                setShowWorkshopDropdown(false);
                              }
                            }}
                            title="Eliminar workshop"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          {(currentWorkshop || hasUnsavedChanges) && (
            <button
              className="p-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors"
              onClick={() => currentWorkshop ? saveCurrentWorkshop() : setShowSaveDialog(true)}
              title={currentWorkshop ? 'Guardar cambios' : 'Guardar workshop'}
            >
              <Save size={16} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${showArrows ? 'bg-neutral-700 text-white' : 'hover:bg-neutral-800'}`}
            onClick={() => setShowArrows((s) => !s)}
            title={showArrows ? 'Ocultar flechas' : 'Mostrar flechas'}
          >
            <ArrowRight size={20} />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${show3D ? 'bg-neutral-700 text-white' : 'hover:bg-neutral-800'}`}
            onClick={() => setShow3D((s) => !s)}
            title={show3D ? 'Vista 2D' : 'Vista 3D'}
          >
            <Boxes size={20} />
          </button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Guardar Workshop</h3>
            <input
              type="text"
              value={newWorkshopName}
              onChange={(e) => setNewWorkshopName(e.target.value)}
              placeholder="Nombre del workshop..."
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors"
                onClick={() => {
                  if (newWorkshopName.trim()) {
                    createWorkshop(newWorkshopName);
                    setNewWorkshopName('');
                    setShowSaveDialog(false);
                  }
                }}
              >
                Guardar
              </button>
              <button
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg transition-colors"
                onClick={() => {
                  setNewWorkshopName('');
                  setShowSaveDialog(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showWorkshopDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowWorkshopDropdown(false)}
        />
      )}

      <div className="flex gap-6">
        {/* Main field area */}
        <div className="flex-1">
          <div className="mb-4">
            <select
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-lg font-medium w-full max-w-md"
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

          {/* Field */}
          <div
            className="relative rounded-2xl overflow-hidden mb-6"
            style={{
              perspective: show3D ? '1000px' : undefined
            }}
          >
            <div
              className="relative w-full h-[28rem] bg-gradient-to-br from-green-600/90 to-green-700/90"
              style={
                show3D
                  ? {
                      transform: 'rotateX(25deg) skewY(-10deg)',
                      transformOrigin: 'center top'
                    }
                  : {}
              }
            >
              {/* Field lines - more realistic futsal court */}
              <div className="absolute inset-6 border-2 border-white/30 rounded-lg"></div>
              <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-white/30"></div>
              <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

              {/* Goal areas */}
              <div className="absolute left-6 top-1/2 w-16 h-24 border-2 border-white/25 rounded-r-lg -translate-y-1/2"></div>
              <div className="absolute right-6 top-1/2 w-16 h-24 border-2 border-white/25 rounded-l-lg -translate-y-1/2"></div>

              {/* Path arrows */}
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
                      <path d="M0 0 L4 2 L0 4 z" fill="rgba(255,255,255,0.8)" />
                    </marker>
                  </defs>
                  <polyline
                    points={pathString}
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrow)"
                  />
                </svg>
              )}

              {/* Ball */}
              <motion.div
                className="absolute w-5 h-5 bg-white rounded-full shadow-lg border-2 border-black/20"
                animate={{
                  left: `${currentPath[ballPosIndex].x}%`,
                  top: `${currentPath[ballPosIndex].y}%`
                }}
                transition={{ type: 'tween', duration: 0.8, ease: 'easeInOut' }}
                style={{ marginLeft: '-10px', marginTop: '-10px' }}
              />
            </div>
          </div>

          {/* Drill info */}
          <div className="bg-neutral-900/60 rounded-xl p-6">
            <p className="text-neutral-200 mb-5 leading-relaxed">{currentDrill.description}</p>

            {/* Coaching cues */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Puntos Clave</h4>
              {currentDrill.cues.map((cue, idx) => (
                <div key={idx}>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      tooltip?.keyword === cue.keyword
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-white'
                    }`}
                    onClick={() => setTooltip(tooltip?.keyword === cue.keyword ? null : cue)}
                  >
                    <span className="font-medium">{cue.keyword}</span>
                  </button>
                  {tooltip?.keyword === cue.keyword && (
                    <div className="mt-2 p-4 bg-neutral-800/90 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-neutral-300 leading-relaxed">{tooltip.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 space-y-5">
          {/* Stats */}
          <div className="bg-neutral-900/80 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">{passes}</div>
            <div className="text-sm text-neutral-400">pases completados</div>
          </div>

          {/* Team randomizer */}
          <div className="bg-neutral-900/80 rounded-xl p-5">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-neutral-200">
              <Users size={18} /> Equipos
            </h3>
            <TeamRandomizer />
          </div>

          {/* Difficulty dice */}
          <div className="bg-neutral-900/80 rounded-xl p-5">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-neutral-200">
              <Dice6 size={18} /> Dificultad
            </h3>
            <button
              onClick={rollDice}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors font-medium"
            >
              Tirar dado
            </button>
            {diceResult && (
              <div className="mt-4 p-4 bg-neutral-800/80 rounded-lg">
                <p className="font-medium text-sm text-white">{diceResult.name}</p>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{diceResult.description}</p>
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
        placeholder="Nombres separados por coma..."
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm mb-3 h-16 resize-none placeholder-neutral-500"
      />
      <button
        onClick={randomize}
        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors text-sm"
      >
        Generar equipos
      </button>
      {teams && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 bg-neutral-800 rounded-lg p-3">
              <p className="font-medium text-xs text-neutral-400 mb-2">EQUIPO A</p>
              <div className="space-y-1">
                {teams.A.map((p, i) => (
                  <div key={i} className="text-sm">{p}</div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-neutral-800 rounded-lg p-3">
              <p className="font-medium text-xs text-neutral-400 mb-2">EQUIPO B</p>
              <div className="space-y-1">
                {teams.B.map((p, i) => (
                  <div key={i} className="text-sm">{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}