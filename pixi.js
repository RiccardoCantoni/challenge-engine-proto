// todorc
//submit
//leave page
//win
//sometimes while moving along y the angle is flipped (probably a mix of flip + angle)

// window.onbeforeunload = function() {
//   return "Data will be lost if you leave the page, are you sure?";
// }

const Player = class {
  position
  move
}

init = false
hasMoved = false
setupWorld = () => {
  if (!init) {
    PAGE_MANAGER.init()
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
    // Create the application helper
    document.getElementById('pixi').appendChild(GAME_MANAGER.pixiApp.view) // add its render target to the page
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
  do {
    p1 = getRandomVector(0,9)
    p2 = getRandomVector(0,9)
  } while (distance(p1,p2) <= 4)

  GAME_MANAGER.instantiate('player','resources/man.svg', [21,35], p1)
  GAME_MANAGER.instantiate('flag','resources/racing-flag.svg', [36,36], p2, false)

  // initial state & actions
  const p = new Player()
  p.position = p1
  p.move = (v) => GAME_MANAGER.wrappers.move(v)
  GAME_MANAGER.state = {
    player: p,
    target: {position: p2}
  }
}

checkWon = () => vectorEquals(GAME_MANAGER.state.player.position, GAME_MANAGER.state.target.position)

gameTick = () => {
  //update state
  hasMoved = false
  GAME_MANAGER.state.player.position = GAME_MANAGER.dynamicObjects[0].position
  GAME_MANAGER.wrappers.update(GAME_MANAGER.state)
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
  GAME_MANAGER.wrappers.update(GAME_MANAGER.state)
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
  console.clear()
  setupWorld()
}

const onSubmit = () => {
  PAGE_MANAGER.submit('tutorial')
}