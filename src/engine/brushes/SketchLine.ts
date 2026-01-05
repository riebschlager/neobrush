import { Vector2D } from '../core/Vector2D'

export interface SketchLineOptions {
  numberOfVertices: number
  easeFactor: number
  speedFactor: number
  startX: number
  startY: number
}

export class SketchLine {
  private vertices: Vector2D[]
  private distances: Vector2D[]
  private endPoints: Vector2D[]
  private easeFactor: number
  private speedFactor: number
  private numberOfVertices: number

  constructor(options: SketchLineOptions) {
    this.numberOfVertices = options.numberOfVertices
    this.easeFactor = options.easeFactor
    this.speedFactor = options.speedFactor

    this.vertices = []
    this.distances = []
    this.endPoints = []

    for (let i = 0; i < this.numberOfVertices; i++) {
      this.vertices.push(new Vector2D(options.startX, options.startY))
      this.distances.push(new Vector2D())
      this.endPoints.push(new Vector2D())
    }
  }

  update(targetX: number, targetY: number): void {
    for (let i = 0; i < this.numberOfVertices; i++) {
      const distance = this.distances[i]!
      const vertex = this.vertices[i]!
      const endPoint = this.endPoints[i]!
      const firstVertex = this.vertices[0]!

      if (i === 0) {
        // First vertex follows the cursor
        distance.x = targetX - firstVertex.x
        distance.y = targetY - firstVertex.y
      } else {
        // Each subsequent vertex follows the previous one
        const prevVertex = this.vertices[i - 1]!
        distance.x = prevVertex.x - vertex.x
        distance.y = prevVertex.y - vertex.y
      }

      // Apply ease factor (controls responsiveness)
      distance.mult(this.easeFactor)

      // Accumulate momentum in endpoint
      endPoint.add(distance)

      // Move vertex toward endpoint
      vertex.add(endPoint)

      // Apply speed factor (controls damping)
      endPoint.mult(this.speedFactor)
    }
  }

  getVertices(): Vector2D[] {
    return this.vertices
  }

  getMiddleVertex(): Vector2D {
    const midIndex = Math.floor(this.numberOfVertices / 2)
    return this.vertices[midIndex]!
  }
}
