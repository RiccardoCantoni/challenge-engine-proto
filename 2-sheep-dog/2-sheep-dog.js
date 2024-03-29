window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
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

checkWon = () => GAME_MANAGER.getGameoObjectsByTag('sheep').length === 0

onLoad = () => {
  setupWorld()
}

init = false
hasMoved = false
posCache = []
setupWorld = () => {
  if (!init) {
    for (let i = -2; i<3; i++) {
      for (let j = -2; j<3; j++) {
        posCache.push([i,j])
      }
    }
    // Init gm
    GAME_MANAGER.terrain.size = [16,16]
    GAME_MANAGER.terrain.cellSize = 35 
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
    GAME_MANAGER.resetTime()
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
    GAME_MANAGER.move('dog', v)
    hasMoved = true
  }
  
  //start ticker
  GAME_MANAGER.resetTime()
  GAME_MANAGER.gameTick = () => gameTick()
}

instantiateWorldState = () => {
  // Instantiate stuff
  let p1 = [0,0]
  let p2 = [0,0]
  let p3 = [0,0]
  do {
    p1 = getRandomVector(1,15)
    p2 = getRandomVector(1,15)
    p3 = getRandomVector(1,15)
  } while (distance(p1,p2) <= 8 || distance(p1,p3) <= 8 || distance(p3,p2) <= 8)

  GAME_MANAGER.instantiate('flag','./../resources/images/racing-flag.svg', [34,34], p1, false, {physical: false})
  GAME_MANAGER.instantiate('dog','./../resources/images/dog.svg', [36,30], p3, true)
  const tmpCache = 
    shuffle(posCache)
    .map(p => vectorSum(p,p2))
    .filter(p => isInBoundaries(p, GAME_MANAGER))
  const sheep = []
  for (let i = 0; i<5; i++){
    sheep.push(GAME_MANAGER.instantiate('sheep'+i,'./../resources/images/sheep.svg', [33,26], tmpCache[i], true, {sheep:true}))
  }

  // initial state & actions
  GAME_MANAGER.state = {
    u: UTIL,
    dog: { position: p3, move: (v) => GAME_MANAGER.wrappers.move(v) },
    target: {position: p1},
    sheep: sheep.map(s =>({position:s.position}))
  }
}

gameTick = () => {
  //update state
  hasMoved = false
  GAME_MANAGER.state.dog.position = GAME_MANAGER.getGameObject('dog').position
  GAME_MANAGER.state.sheep = GAME_MANAGER.getGameoObjectsByTag('sheep').map(s => ({position: s.position}))

  try{
    GAME_MANAGER.wrappers.update(GAME_MANAGER.state)
    const dog = GAME_MANAGER.getGameObject('dog')
    const flag = GAME_MANAGER.getGameObject('flag', false)
    const allSheep = shuffle(GAME_MANAGER.getGameoObjectsByTag('sheep'))
    shuffle(cache1)
  const sheepMovement = allSheep
    .map(s => ({
      go: s,
      idle: distance(s.position, dog.position) > 2,
      movements: distance(s.position, dog.position) > 2 ? [] :
      cache1
      .map(v => vectorSum(v, s.position))
      .filter(v => isInBoundaries(v, GAME_MANAGER))
      .filter(v => !vectorEquals(v, dog.position))
      //if length > 4 exclude distance = 2
      .filter((v,_,arr) => !(arr.length > 4 && manhattanDistance(v, dog.position) < 2)) 
      .map(v => vectorSubtract(v, s.position))
    }))
    sheepMovement.map(s => {
      if (s.idle){
        if (Math.random() < 0.1) GAME_MANAGER.move(s.go.id, randomPick(cache1))
      } else {
        const tg = s.movements.find(m => vectorEquals(vectorSum(m, s.go.position), flag.position))
        if (tg) { GAME_MANAGER.move(s.go.id, tg) }
        else { GAME_MANAGER.move(s.go.id, s.movements[0]) }
      }
    })
    allSheep
      .filter(s => vectorEquals(s.position, flag.position))
      .map(s => GAME_MANAGER.deInstantiate(s.id))
  } catch(err){
    console.error('an error occurred while executing your code:', err)
    GAME_MANAGER.time.paused = true
    PAGE_MANAGER.stop()
    PAGE_MANAGER.didEval = false
  }

  if (checkWon()) {
    GAME_MANAGER.time.paused = true
    PAGE_MANAGER.openWinScreen()
  }
}

const onRun = (t = 300) => {
  hasMoved = false
  GAME_MANAGER.time.gameTick = t
  GAME_MANAGER.time.paused = !GAME_MANAGER.time.paused
  if(GAME_MANAGER.time.paused) {
    PAGE_MANAGER.pause()
  } else if (t === 300){
    PAGE_MANAGER.run()
  } else {
    PAGE_MANAGER.runFast()
  }
  if (GAME_MANAGER.time.paused) return
  PAGE_MANAGER.evalCode()
  GAME_MANAGER.time.lastGameTick = GAME_MANAGER.time.elapsed
}

const onRunFast = () => {
  onRun(100)
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
  GAME_MANAGER.deInstantiate('dog')
  GAME_MANAGER.deInstantiate('flag', false)
  GAME_MANAGER.getGameoObjectsByTag('sheep').map(s => GAME_MANAGER.deInstantiate(s.id))

  console.clear()
  setupWorld()
}

const onSubmit = () => {
  PAGE_MANAGER.submit('2-SheepDog')
}