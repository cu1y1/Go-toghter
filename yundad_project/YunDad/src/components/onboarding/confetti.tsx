'use client'

import { useMemo } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
  rotation: number
}

// Generate confetti pieces outside of render
const generateConfettiPieces = (): ConfettiPiece[] => {
  const colors = [
    'bg-orange-400',
    'bg-orange-500',
    'bg-yellow-400',
    'bg-pink-400',
    'bg-green-400',
    'bg-blue-400',
    'bg-purple-400',
  ]

  const pieces: ConfettiPiece[] = []
  for (let i = 0; i < 50; i++) {
    pieces.push({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    })
  }
  return pieces
}

export function Confetti() {
  const pieces = useMemo(() => generateConfettiPieces(), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-sm animate-confetti-fall`}
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
