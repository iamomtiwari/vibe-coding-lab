const BODY_SHAPES = {
  round: <circle cx="100" cy="115" r="75" />,
  square: <rect x="28" y="43" width="144" height="144" rx="28" />,
  star: (
    <path d="M100 20 L120 80 L184 80 L132 118 L152 180 L100 142 L48 180 L68 118 L16 80 L80 80 Z" />
  ),
}

function PetAvatar({ shape = 'round', color = '#f4a261', size = 160 }) {
  const body = BODY_SHAPES[shape] ?? BODY_SHAPES.round

  return (
    <svg
      className="pet-avatar"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Pet avatar"
    >
      <g fill={color}>{body}</g>
      <g className="pet-eyes">
        <circle cx="75" cy="105" r="16" fill="#fff" />
        <circle cx="125" cy="105" r="16" fill="#fff" />
        <circle cx="75" cy="105" r="7" fill="#1f2933" />
        <circle cx="125" cy="105" r="7" fill="#1f2933" />
      </g>
      <path
        className="pet-mouth"
        d="M80 140 Q100 150 120 140"
        stroke="#1f2933"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default PetAvatar
