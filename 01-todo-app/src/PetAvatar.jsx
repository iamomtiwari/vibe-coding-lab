import { useEffect, useRef, useState } from 'react'

const BODY_SHAPES = {
  round: <circle cx="100" cy="115" r="75" />,
  square: <rect x="28" y="43" width="144" height="144" rx="28" />,
  star: (
    <path d="M100 20 L120 80 L184 80 L132 118 L152 180 L100 142 L48 180 L68 118 L16 80 L80 80 Z" />
  ),
  diamond: (
    <rect x="45" y="45" width="110" height="110" rx="16" transform="rotate(45 100 100)" />
  ),
  blob: (
    <path d="M100 40 C140 40 172 65 172 106 C172 146 144 187 100 189 C56 191 29 149 30 108 C31 68 60 40 100 40 Z" />
  ),
}

export const PET_SHAPES = Object.keys(BODY_SHAPES)

export const PET_COLORS = [
  '#f4a261',
  '#e76f51',
  '#2a9d8f',
  '#e9c46a',
  '#8ecae6',
  '#a685e2',
  '#ff6b9d',
  '#6c757d',
]

const EYE_CENTERS = [
  { x: 75, y: 105 },
  { x: 125, y: 105 },
]
const PUPIL_RANGE = 6
const PET_CENTER = { x: 100, y: 105 }

const MOUTH_PATHS = {
  neutral: 'M80 140 Q100 150 120 140',
  happy: 'M75 130 Q100 168 125 130',
}

export const ACCESSORIES = [
  { id: 'bowtie', label: 'Bow Tie', unlockLevel: 2 },
  { id: 'hat', label: 'Hat', unlockLevel: 4 },
  { id: 'glasses', label: 'Glasses', unlockLevel: 6 },
]

const ACCESSORY_LAYERS = {
  bowtie: (
    <g>
      <path d="M85 168 L100 178 L85 188 Z" fill="#d64550" />
      <path d="M115 168 L100 178 L115 188 Z" fill="#d64550" />
      <circle cx="100" cy="178" r="5" fill="#a13342" />
    </g>
  ),
  hat: (
    <g>
      <path d="M55 45 Q100 -10 145 45 Z" fill="#3b4a54" />
      <rect x="45" y="40" width="110" height="12" rx="6" fill="#1f2933" />
    </g>
  ),
  glasses: (
    <g stroke="#1f2933" strokeWidth="4" fill="none">
      <circle cx="75" cy="105" r="20" />
      <circle cx="125" cy="105" r="20" />
      <line x1="95" y1="105" x2="105" y2="105" />
    </g>
  ),
}

let nextHeartId = 0

function PetAvatar({
  shape = 'round',
  color = '#f4a261',
  size = 160,
  expression = 'neutral',
  equipped = [],
}) {
  const svgRef = useRef(null)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [hearts, setHearts] = useState([])

  // Pupils track the cursor anywhere on the page, not just while hovering.
  useEffect(() => {
    function handleMouseMove(e) {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      const scaleX = 200 / rect.width
      const scaleY = 200 / rect.height
      const mouseX = (e.clientX - rect.left) * scaleX
      const mouseY = (e.clientY - rect.top) * scaleY
      const angle = Math.atan2(mouseY - PET_CENTER.y, mouseX - PET_CENTER.x)
      setPupilOffset({
        x: Math.cos(angle) * PUPIL_RANGE,
        y: Math.sin(angle) * PUPIL_RANGE,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function handlePat() {
    const id = nextHeartId++
    const drift = Math.round((Math.random() - 0.5) * 50)
    setHearts((prev) => [...prev, { id, drift }])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id))
    }, 900)
  }

  const body = BODY_SHAPES[shape] ?? BODY_SHAPES.round
  const mouthPath = MOUTH_PATHS[expression] ?? MOUTH_PATHS.neutral

  return (
    <div className="pet-stage" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        className="pet-avatar"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role="button"
        tabIndex={0}
        aria-label="Pet avatar, click to pat"
        onClick={handlePat}
      >
        <g fill={color}>{body}</g>
        <g className="pet-eyes">
          {EYE_CENTERS.map((eye, i) => (
            <g key={i}>
              <circle cx={eye.x} cy={eye.y} r="16" fill="#fff" />
              <circle
                cx={eye.x + pupilOffset.x}
                cy={eye.y + pupilOffset.y}
                r="7"
                fill="#1f2933"
              />
            </g>
          ))}
        </g>
        <path
          className="pet-mouth"
          d={mouthPath}
          stroke="#1f2933"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {equipped.map((id) => (
          <g key={id} className={`pet-accessory pet-accessory-${id}`}>
            {ACCESSORY_LAYERS[id]}
          </g>
        ))}
      </svg>
      <div className="pet-hearts">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="pet-heart"
            style={{ '--drift': `${h.drift}px` }}
          >
            💗
          </span>
        ))}
      </div>
    </div>
  )
}

export default PetAvatar
