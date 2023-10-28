const GAME_MANAGER = {
  terrain: {
    size: [],
    cellSize: 0
  },
  time: {
    gameTick: undefined,
    elapsed: undefined,
    lastGameTick: undefined,
    tickNumber: 0,
    paused: true,
    step: false
  },
  dynamicObjects: [],
  staticObjects: [],
  pixiApp: undefined,

  resetTime (frameTime) {
    this.time.gameTick = frameTime
    this.time.elapsed = new Date().getTime()
    this.time.lastGameTick = this.time.elapsed
    this.time.tickNumber = 0
  },

  instantiate (id, spriteName, size, coords, dynamic=true) {
    const go = new GameObject(id, spriteName, size, coords)
    if (dynamic) {
      this.dynamicObjects.push(go)
    } else {
      this.staticObjects.push(go)
    }
    this.pixiApp.stage.addChild(go.sprite)
    return go
  },

  deInstantiate (id, dynamic=true) {
    let go
    if (dynamic) {
      go = this.dynamicObjects.find(o => o.id === id)
      this.dynamicObjects = this.dynamicObjects.filter(o => o.id !== id)
    } else {
      go = this.staticObjects.find(o => o.id === id)
      this.staticObjects = this.staticObjects.filter(o => o.id !== id)
    }
    this.pixiApp.stage.removeChild(go.sprite)
    go.sprite.destroy()
    delete go
  },

  move (id, v) {
    const go = this.dynamicObjects.find(o => o.id === id)
    let w = arraySum(go.position, v)
    if (w[0] < 0 || w[0]>=this.terrain.size[0] || w[1] < 0 || w[1]>=this.terrain.size[1]) return
    go.position = w
    w = coordsToPixels(w, this)
    go.sprite.x = w[0]
    go.sprite.y = w[1]
    if (v[0] || v[1])
    go.sprite.angle =  v[1] < 0 ? -90 : v[1] > 0 ? 90 : 0
    if (v[0] < 0 && go.sprite.scale.x > 0) go.sprite.scale.x *= -1
  },

  wrappers: {
    consoleLog: console.log,
    move: () => {},
    update: () => {}
  },
  worldState: {},

  engineTick () {
    this.time.elapsed += this.pixiApp.ticker.deltaMS
    if (this.time.elapsed - this.time.lastGameTick >= this.time.gameTick) { // next game tick
      if (!this.time.paused || this.time.step) {
        gameTick(this.worldState)
        this.time.step = false
      }
      this.time.lastGameTick = this.time.elapsed
    }
  },
  gameTick: () => {}
}

const GameObject = class {
  constructor (id, spriteName, size, coords, angle = 0) {
      this.id = id
      //coords
      this.position = coords
      this.nextPosition = coords
      //px
      this.pxPosition = coordsToPixels(coords, GAME_MANAGER)
      //sprite
      this.sprite = PIXI.Sprite.from(spriteName);
      this.sprite.anchor.set(0.5,0.5)
      this.sprite.x = this.pxPosition[0]
      this.sprite.y = this.pxPosition[1]
      this.sprite.width = size[0]
      this.sprite.height = size[1]
      this.sprite.angle = angle
  }
}