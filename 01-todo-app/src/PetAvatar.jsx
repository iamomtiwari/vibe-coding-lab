import { useEffect, useRef, useState } from 'react'

const BODY_SHAPES = {
  round: <circle cx="100" cy="115" r="75" />,
  square: <rect x="28" y="43" width="144" height="144" rx="28" />,
  star: (
    <path d="M100 20 L120 80 L184 80 L132 118 L152 180 L100 142 L48 180 L68 118 L16 80 L80 80 Z" />
  ),
}

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

let nextHeartId = 0

function PetAvatar({
  shape = 'round',
  color = '#f4a261',
  size = 160,
  expression = 'neutral',
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
