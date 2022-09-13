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

}

class RectangularHitbox {
    // in a component these would be offsets from entity transform
    pos: Vector2
    width: number
    height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.pos = new Vector2(x, y)
        this.width = width
        this.height = height
    }

}

function dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y
}

function project(a: Vector2, b: Vector2): number {
    return dot(a, b) / b.length
}

function satCollision(a: RectangularHitbox, b: RectangularHitbox): boolean {
    const aVertices: Vector2[] = [a.pos, new Vector2(a.pos.x + a.width, a.pos.y), new Vector2(a.pos.x + a.width, a.pos.y + a.height), new Vector2(a.pos.x, a.pos.y + a.height)]
    const bVertices: Vector2[] = [b.pos, new Vector2(b.pos.x + b.width, b.pos.y), new Vector2(b.pos.x + b.width, b.pos.y + b.height), new Vector2(b.pos.x, b.pos.y + b.height)]
    // for each rectangle, calculate edges
    const aEdges: Vector2[] = []
    const bEdges: Vector2[] = []
    //a
    for (let i = 0; i < aVertices.length; i++) {
        if (i === aVertices.length - 1) {
            const edge = new Vector2(aVertices[0].x - aVertices[i].x, aVertices[0].y - aVertices[i].y)
            aEdges.push(edge)
            continue
        }
        const edge = new Vector2(aVertices[i+1].x - aVertices[i].x, aVertices[i+1].y - aVertices[i].y)
        aEdges.push(edge)
    }
    //b
    for (let i = 0; i < bVertices.length; i++) {
        if (i === bVertices.length - 1) {
            const edge = new Vector2(bVertices[0].x - bVertices[i].x, bVertices[0].y - bVertices[i].y)
            bEdges.push(edge)
            continue
        }
        const edge = new Vector2(bVertices[i+1].x - bVertices[i].x, bVertices[i+1].y - bVertices[i].y)
        bEdges.push(edge)
    }
    // for each perpendicular axis, project vertices
    for (let i = 0; i < aEdges.length; i++) {
        const axis = aEdges[i].perpendicular
        const aProjections: number[] = []
        const bProjections: number[] = []
        for (let j = 0; j < aVertices.length; j++) {
            aProjections.push(project(aVertices[j], axis))
        }
        for (let j = 0; j < bVertices.length; j++) {
            bProjections.push(project(bVertices[j], axis))
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
            //
    return true
}

const statRect = new RectangularHitbox(200, 200, 200, 100)
const movingRect = new RectangularHitbox(0, 0, 100, 150)

document.addEventListener("mousemove", (event: MouseEvent) => [movingRect.pos.x, movingRect.pos.y] = [event.offsetX, event.offsetY])

export function update(dt: number) {
    const p = new Path2D()
    p.rect(statRect.pos.x, statRect.pos.y, statRect.width, statRect.height)
    p.rect(movingRect.pos.x, movingRect.pos.y, movingRect.width, movingRect.height)
    p.closePath()
    const colliding = satCollision(statRect, movingRect)
    engine.graphics.fillStyle = colliding ? "red": "grey"
    engine.graphics.fill(p)
}