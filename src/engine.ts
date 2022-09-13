import * as collisions from "./collisions"

class Engine {

    // TODO: make renderer class that collects render data during update run, then draws in one sweep, together with camera data
    readonly canvas: HTMLCanvasElement
    readonly graphics: CanvasRenderingContext2D

    private _shouldStop: boolean

    private _gameSpeed: number
    private _deltaTime: number
    private _currentTime: number
    private _lastTime: number
    private _frames: number
    private _frameTimer: number

    public constructor() {
        [this.canvas, this.graphics] = this._createCanvas()
        this._maximizeCanvas()
        window.addEventListener("resize", (() => this._maximizeCanvas()).bind(this))
        
        this._gameSpeed = 1
    }
    
    public start(): void {
        this._shouldStop = false
        this._lastTime = window.performance.now()
        this._frames = 0
        this._frameTimer = 0
        this._loop()
    }

    public stop(): void {
        this._shouldStop = true
    }

    private _loop(): void {
        if (!this._shouldStop) window.requestAnimationFrame(this._loop.bind(this))

        this._currentTime = window.performance.now()
        this._deltaTime = this._currentTime - this._lastTime
        this._lastTime = this._currentTime
        
        this.graphics.clearRect(0, 0, this.canvas.width, this.canvas.height)
        collisions.update(this._deltaTime * this._gameSpeed)

        this._frames++
        this._frameTimer += this._deltaTime
        if (this._frameTimer >= 1000) {
            console.log(this._frames)
            this._frameTimer -= 1000
            this._frames = 0
        }
    }

    private _createCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (ctx === null) throw new Error("ctx is null wtf")
        document.body.appendChild(canvas)
        return [canvas, ctx]
    }

    private _maximizeCanvas(): void {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

}

const engine = new Engine()
export default engine