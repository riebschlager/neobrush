export class Vector2D {
  x: number
  y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  copy(): Vector2D {
    return new Vector2D(this.x, this.y)
  }

  add(v: Vector2D): this {
    this.x += v.x
    this.y += v.y
    return this
  }

  sub(v: Vector2D): this {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  mult(scalar: number): this {
    this.x *= scalar
    this.y *= scalar
    return this
  }

  div(scalar: number): this {
    if (scalar !== 0) {
      this.x /= scalar
      this.y /= scalar
    }
    return this
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize(): this {
    const m = this.mag()
    if (m > 0) {
      this.div(m)
    }
    return this
  }

  limit(max: number): this {
    if (this.mag() > max) {
      this.normalize().mult(max)
    }
    return this
  }

  dist(v: Vector2D): number {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  static sub(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y)
  }

  static add(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y)
  }

  static mult(v: Vector2D, scalar: number): Vector2D {
    return new Vector2D(v.x * scalar, v.y * scalar)
  }
}
