const cardinalDirections = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const

export type CardinalDirection = (typeof cardinalDirections)[number]

export function windDirectionToCardinal(degrees: number): CardinalDirection {
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const directionIndex = Math.floor((normalizedDegrees + 22.5) / 45) % cardinalDirections.length

  return cardinalDirections[directionIndex]
}
