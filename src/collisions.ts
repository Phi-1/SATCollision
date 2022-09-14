import engine from "./engine"

class Vector2 {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    get length(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y))
    }

    get perpendicular(): Vector2 {
        return new Vector2(-this.y, this.x)
    }

    static dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y
    }

    static project(a: Vector2, b: Vector2): number {
        return Vector2.dot(a, b) / b.length
    }

    // expects radians
    static rotate(vector: Vector2, angle: number) {
        return new Vector2(vector.x * Math.cos(angle) - vector.y * Math.sin(angle), vector.x * Math.sin(angle) + vector.y * Math.cos(angle))
    }
}

class RectangularHitbox {
    // in a component these would be offsets from entity transform
    entity: Entity
    width: number
    height: number
    private _vertices: Vector2[] = [
        new Vector2(-1, -1),
        new Vector2( 1, -1),
        new Vector2( 1,  1),
        new Vector2(-1,  1)
    ]

    constructor(entity: Entity, width: number, height: number) {
        this.entity = entity
        this.width = width
        this.height = height
    }

    get vertices(): Vector2[] {
        const vertices = []
        for (let i = 0; i < this._vertices.length; i++) {
            const vscaled = new Vector2(this._vertices[i].x * this.width, this._vertices[i].y * this.height)
            const vrotated = Vector2.rotate(vscaled, this.entity.transform.rotation)
            const vtranslated = new Vector2(vrotated.x + this.entity.transform.pos.x, vrotated.y + this.entity.transform.pos.y)
            vertices.push(vtranslated)
        }
        return vertices
    }

}

type transform = {pos: Vector2, rotation: number}
class Entity {
    transform: transform
    hitbox: RectangularHitbox
    width: number
    height: number

    constructor(x: number, y: number, width: number, height: number, angle: number) {
        this.transform = {pos: new Vector2(x, y), rotation: angle}
        this.width = width
        this.height = height
        this.hitbox = new RectangularHitbox(this, this.width, this.height)
    }
}

function satCollision(a: RectangularHitbox, b: RectangularHitbox): boolean {
    // for each rectangle, calculate edges
    const aEdges: Vector2[] = []
    const bEdges: Vector2[] = []
    //a
    for (let i = 0; i < a.vertices.length; i++) {
        if (i === a.vertices.length - 1) {
            const edge = new Vector2(a.vertices[0].x - a.vertices[i].x, a.vertices[0].y - a.vertices[i].y)
            aEdges.push(edge)
            continue
        }
        const edge = new Vector2(a.vertices[i+1].x - a.vertices[i].x, a.vertices[i+1].y - a.vertices[i].y)
        aEdges.push(edge)
    }
    //b
    for (let i = 0; i < b.vertices.length; i++) {
        if (i === b.vertices.length - 1) {
            const edge = new Vector2(b.vertices[0].x - b.vertices[i].x, b.vertices[0].y - b.vertices[i].y)
            bEdges.push(edge)
            continue
        }
        const edge = new Vector2(b.vertices[i+1].x - b.vertices[i].x, b.vertices[i+1].y - b.vertices[i].y)
        bEdges.push(edge)
    }
    // for each perpendicular axis, project vertices
    for (let i = 0; i < aEdges.length; i++) {
        const axis = aEdges[i].perpendicular
        const aProjections: number[] = []
        const bProjections: number[] = []
        for (let j = 0; j < a.vertices.length; j++) {
            aProjections.push(Vector2.project(a.vertices[j], axis))
        }
        for (let j = 0; j < b.vertices.length; j++) {
            bProjections.push(Vector2.project(b.vertices[j], axis))
        }
        // check for gap or overlap
        // if gap, there is no collision so return false
        let maxA = Math.max(...aProjections)
        let minA = Math.min(...aProjections)
        let maxB = Math.max(...bProjections)
        let minB = Math.min(...bProjections)
        if (maxA < minB || maxB < minA) {
            return false
        }
    }
    return true
}

const statRect = new Entity(400, 400, 200, 100, 60)
const movingRect = new Entity(0, 0, 100, 100, 45)

document.addEventListener("mousemove", (event: MouseEvent) => [movingRect.transform.pos.x, movingRect.transform.pos.y] = [event.offsetX, event.offsetY])

export function update(dt: number) {
    const p = new Path2D()
    const sv = statRect.hitbox.vertices
    const mv = movingRect.hitbox.vertices
    p.moveTo(sv[sv.length-1].x, sv[sv.length-1].y)
    for (let i = sv.length - 1; i >= 0; i--) {
        p.lineTo(sv[i].x, sv[i].y)
    }
    p.moveTo(mv[mv.length-1].x, mv[mv.length-1].y)
    for (let i = mv.length - 1; i >= 0; i--) {
        p.lineTo(mv[i].x, mv[i].y)
    }
    p.closePath()
    const colliding = satCollision(statRect.hitbox, movingRect.hitbox)
    engine.graphics.strokeStyle = colliding ? "red": "grey"
    engine.graphics.lineWidth = 1
    engine.graphics.stroke(p)
    engine.graphics.strokeStyle = "blue"
    engine.graphics.fillRect(statRect.transform.pos.x-2, statRect.transform.pos.y-2, 4, 4)
    engine.graphics.fillRect(movingRect.transform.pos.x-2, movingRect.transform.pos.y-2, 4, 4)
}