window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
}

init = false
hasMoved = false
setupWorld = () => {
  if (!init) {
    // Init gm
    GAME_MANAGER.terrain.size = [10,10]
    GAME_MANAGER.terrain.cellSize = 40
    const w = GAME_MANAGER.terrain.size[0] * GAME_MANAGER.terrain.cellSize
    GAME_MANAGER.pixiApp = new PIXI.Application({ 
      width:w, 
      height:w, 
      autoStart:true, 
      background:'#ffffff'
    })
    PAGE_MANAGER.init(GAME_MANAGER)
    // Draw the world
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(1, '#aeb0af')
    for (let i = 0; i<= w; i += GAME_MANAGER.terrain.cellSize){
      graphics.moveTo(i,0)
      graphics.lineTo(i,w)
      graphics.moveTo(0,i)
      graphics.lineTo(w,i)
    }
    GAME_MANAGER.pixiApp.stage.addChild(graphics)
    // start time
    GAME_MANAGER.resetTime(300)
    GAME_MANAGER.pixiApp.ticker.add(() => GAME_MANAGER.engineTick())    
    init = true
  }

  instantiateWorldState()
  GAME_MANAGER.wrappers.move = (v) => {
    if (PAGE_MANAGER.didEval) {
      const err = validateMovement(v)
      if (err) {
        PAGE_MANAGER.didEval = false
        GAME_MANAGER.time.paused = true
        console.error(err)
        PAGE_MANAGER.stop()
        return
      }
    }
    GAME_MANAGER.move('player', v)
    hasMoved = true
  }
  
  //start ticker
  GAME_MANAGER.resetTime(300)
  GAME_MANAGER.gameTick = () => gameTick()
}

const valid = new Set([-1,0,1])
validateMovement = (v) => {
  let err 
  if (hasMoved) {
    err = 'invalid movement: you can only move once per update()'
  } else if (!Array.isArray(v) || v.length !== 2) {
    err = 'invalid movement: ' + v + ' \n vector of length 2 expected'
  } else if (v.some(x => !valid.has(x)) || !v.some(x => x === 0)) {
    err = 'invalid movement: ' + v + ' \n vector of magnitude 1'
  }
  return err
}

instantiateWorldState = () => {
  // Instantiate stuff
  let p1 = [0,0]
  let p2 = [0,0]
  let p3 = [0,0]
  do {
    p1 = getRandomVector(0,9)
    p2 = getRandomVector(0,9)
    p3 = getRandomVector(1,8)
  } while (distance(p1,p2) <= 4 || distance(p1,p3) <= 4 || distance(p3,p2) <= 4)

  GAME_MANAGER.instantiate('player','./../resources/images/man.svg', [21,35], p1)
  GAME_MANAGER.instantiate('flag','./../resources/images/racing-flag.svg', [36,36], p2, false)
  GAME_MANAGER.instantiate('trolley','./../resources/images/shopping-trolley-black.svg', [40,40], p3, true, {isPushable:true})

  // initial state & actions
  GAME_MANAGER.state = {
    u: UTIL,
    player: { position: p1, move: (v) => GAME_MANAGER.wrappers.move(v) },
    target: {position: p2},
    trolley: {position: p3, isPushable: true}
  }
}

checkWon = () => vectorEquals(GAME_MANAGER.state.trolley.position, GAME_MANAGER.state.target.position)

gameTick = () => {
  //update state
  hasMoved = false
  GAME_MANAGER.state.player.position = GAME_MANAGER.getGameObject('player').position
  GAME_MANAGER.state.trolley.position = GAME_MANAGER.getGameObject('trolley').position
  try{
    GAME_MANAGER.wrappers.update(GAME_MANAGER.state)
  } catch(err){
    console.error(err)
    GAME_MANAGER.time.paused = true
    PAGE_MANAGER.stop()
    PAGE_MANAGER.didEval = false
  }
  if (checkWon()) {
    GAME_MANAGER.time.paused = true
    PAGE_MANAGER.openWinScreen()
  }
}

onLoad = () => {
  setupWorld()
}

const onRun = () => {
  hasMoved = false
  GAME_MANAGER.time.paused = !GAME_MANAGER.time.paused
  if(GAME_MANAGER.time.paused) {
    PAGE_MANAGER.pause()
  } else {
    PAGE_MANAGER.run()
  }
  if (GAME_MANAGER.time.paused) return
  PAGE_MANAGER.evalCode()
  GAME_MANAGER.time.lastGameTick = GAME_MANAGER.time.elapsed
}

const onStep = () => {
  hasMoved = false
  PAGE_MANAGER.step()
  PAGE_MANAGER.evalCode()
  GAME_MANAGER.time.lastGameTick = GAME_MANAGER.time.elapsed
  GAME_MANAGER.time.step = true
}

const onReset = () => {
  hasMoved = false
  GAME_MANAGER.time.paused = true
  PAGE_MANAGER.reset()
  GAME_MANAGER.deInstantiate('player')
  GAME_MANAGER.deInstantiate('flag', false)
  GAME_MANAGER.deInstantiate('trolley')
  console.clear()
  setupWorld()
}

const onSubmit = () => {
  PAGE_MANAGER.submit('1-Groceries')
}