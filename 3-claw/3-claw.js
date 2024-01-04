// todorc index intro of claw & help page
// todorc cookies
// todorc edit placeholder texts to show that othercode can be written
// checkWon

window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
}

let colors = [
  { id: 'Y', color: '#f5c842' }, 
  { id: 'G', color: '#32a852' }, 
  { id: 'R', color: '#c2320e' }, 
  { id: 'B', color: '#0561eb' }
]

checkWon = () => {
  const ordBlocks = GAME_MANAGER.state.blocks
    .sort((a,b) => (a.position[0] - b.position[0]) ? (a.position[0] - b.position[0]) : (a.position[1] - b.position[1]))
  const ordTarget = GAME_MANAGER.state.target
    .sort((a,b) => (a.position[0] - b.position[0]) ? (a.position[0] - b.position[0]) : (a.position[1] - b.position[1]))
  return !ordBlocks.find((b,i) => ordTarget[i].color !== b.color || !vectorEquals(b.position, ordTarget[i].position))
}

onLoad = () => {
  setupWorld()
}

init = false
hasMoved = false
hasToggled = false
setupWorld = () => {
  if (!init) {
    // Init gm
    GAME_MANAGER.terrain.size = [10,10]
    GAME_MANAGER.terrain.cellSize = 50
    const w = GAME_MANAGER.terrain.size[0] * GAME_MANAGER.terrain.cellSize
    GAME_MANAGER.pixiApp = new PIXI.Application({ 
      width:w, 
      height:w, 
      autoStart:true, 
      backgroundAlpha: 0,
      antialias: true
    })
    PAGE_MANAGER.init(GAME_MANAGER)

    // Draw the world
    const graphics = new PIXI.Graphics()
    graphics.beginFill(0x000000);
    graphics.drawRect(0, 0, GAME_MANAGER.terrain.cellSize*5, GAME_MANAGER.terrain.cellSize*GAME_MANAGER.terrain.size[1]);
    graphics.endFill();
    graphics.lineStyle(1, '#2d2d2d')
    graphics.moveTo(GAME_MANAGER.terrain.cellSize,10*GAME_MANAGER.terrain.cellSize)
    graphics.lineTo(GAME_MANAGER.terrain.cellSize,4*GAME_MANAGER.terrain.cellSize)
    graphics.lineTo(4*GAME_MANAGER.terrain.cellSize,4*GAME_MANAGER.terrain.cellSize)
    graphics.lineTo(4*GAME_MANAGER.terrain.cellSize,10*GAME_MANAGER.terrain.cellSize)


    GAME_MANAGER.pixiApp.stage.addChild(graphics)


    GAME_MANAGER.pixiApp.stage.addChild(graphics)


    const reproduce = new PIXI.Text('Reference', new PIXI.TextStyle(textHighlightStyle))
    reproduce.x = 320;
    reproduce.y = 255;
    GAME_MANAGER.pixiApp.stage.addChild(reproduce);

    // start time
    GAME_MANAGER.resetTime()
    GAME_MANAGER.pixiApp.ticker.add(() => GAME_MANAGER.engineTick())    
    init = true
  }

  instantiateWorldState()

  // set Move
  GAME_MANAGER.wrappers.move = (m) => {
    if (PAGE_MANAGER.didEval) {
      const err = 
        hasMoved ? 'invalid movement: you can only move once per update()' :
          hasToggled ? 'invalid input: you can not move and toggle in the same update()' :
            ![-1,0,1].find(x => x=== m) ? 'invalid movement: valid movements are -1,0,1'
              : null
      if (err) {
        notifyError(err)
        return
      }
    }
    const claw = GAME_MANAGER.getGameObject('claw')
    let v = vectorSum(claw.position, [m,0])
    if (v[0]<0 || v[0]>4) return
    GAME_MANAGER.translateTo('claw', [claw.position[0], 8])
    GAME_MANAGER.move('claw-root', [m,0])
    GAME_MANAGER.getGameObject('claw-line').sprite.height = 0
    GAME_MANAGER.move('claw-line', [m,0])
    GAME_MANAGER.move('claw', [m,0])
    if (claw.tags.block) {
      const carriedBlock = GAME_MANAGER.getGameObject(claw.tags.block)
      GAME_MANAGER.move(carriedBlock.id, [m,0])
      GAME_MANAGER.state.blocks.find(b => b.id === carriedBlock.id).position = carriedBlock.position
    }
    hasMoved = true
    GAME_MANAGER.state.claw.position = claw.position[0]
  }

  // set toggle
  GAME_MANAGER.wrappers.toggle = () => {
    if (PAGE_MANAGER.didEval) {
      const err = 
        hasToggled ? 'invalid input: you can only toggle once per update()' : 
          hasMoved ? 'invalid input: you can not move and toggle in the same update()' : null
      if (err) {
        notifyError(err)
        return
      }
    }
    const claw = GAME_MANAGER.getGameObject('claw')
    const clawLine = GAME_MANAGER.getGameObject('claw-line')
    let blockUnder = GAME_MANAGER.dynamicObjects
      .filter(o => o.tags.isBlock && o.id !== claw.tags.block)
      .filter(o => o.position[0] === claw.position[0])
      .sort((o1,o2) => o2.position[1] - o1.position[1])
      [0]

    if (!claw.tags.block) { //grab
      if (!blockUnder) return
      GAME_MANAGER.translateTo(claw.id, [blockUnder.position[0], 8])
      GAME_MANAGER.translateTo(blockUnder.id, [blockUnder.position[0], 7])
      GAME_MANAGER.state.blocks.find(b => b.id === blockUnder.id).position = blockUnder.position
      clawLine.sprite.height = 0
      claw.tags.block = blockUnder.id
      GAME_MANAGER.state.claw.block = blockUnder.id
    } else { //release
      if (
        claw.position === 0 || claw.position === 4 || (blockUnder && blockUnder.position[1] === 5)) {
        notifyError('invalid toggle: you can\'t place blocks outside the allowed area')
        return
      }
      if (!blockUnder) blockUnder = {position:[claw.position[0], -1]}
      GAME_MANAGER.translateTo(claw.id, [blockUnder.position[0], blockUnder.position[1]+2])
      GAME_MANAGER.translateTo(claw.tags.block, [blockUnder.position[0], blockUnder.position[1]+1])
      const lineLength = 6-blockUnder.position[1]
      clawLine.sprite.height = GAME_MANAGER.terrain.cellSize * lineLength
      clawLine.sprite.y = GAME_MANAGER.terrain.cellSize*(1+lineLength/2)
      GAME_MANAGER.state.blocks.find(b => b.id === claw.tags.block).position = [blockUnder.position[0], blockUnder.position[1]+1]
      claw.tags.block = null
      GAME_MANAGER.state.claw.block = null
    }
    hasToggled = true
  }
  
  //start ticker
  GAME_MANAGER.resetTime()
  GAME_MANAGER.gameTick = () => gameTick()
}

instantiateWorldState = () => {
  //instantiate stuff
  if (!GAME_MANAGER.getGameObject('_f1', false)) {
    GAME_MANAGER.instantiate('_f1','./../resources/images/frame-white.png', [50,50], [0,9], false, {physical:false})
    GAME_MANAGER.instantiate('_f2','./../resources/images/frame-white.png', [50,50], [1,9], false, {physical:false})
    GAME_MANAGER.instantiate('_f3','./../resources/images/frame-white.png', [50,50], [2,9], false, {physical:false})
    GAME_MANAGER.instantiate('_f4','./../resources/images/frame-white.png', [50,50], [3,9], false, {physical:false})
    GAME_MANAGER.instantiate('_f5','./../resources/images/frame-white.png', [50,50], [4,9], false, {physical:false})
  }
  GAME_MANAGER.instantiate('claw-root','./../resources/images/carriage-white.png', [50,50], [0,9])
  GAME_MANAGER.instantiate('claw-line','./../resources/images/line-white.png', [50,0], [0,8], true, {physical:false})
  GAME_MANAGER.instantiate('claw','./../resources/images/claw-idle-white.png', [50,50], [0,8], {block:null})
  
  colors = shuffle(colors)
  blocks = []
  for (let x=0; x<3; x++){
    for (let y=0; y<3; y++){
      blocks.push(colors[x])
    }
  }

  targetBlocks = [...shuffle(blocks)]
  cache1.forEach((v,i) => {
    GAME_MANAGER.instantiate(
      'ref'+i,
      './../resources/images/white-block.png',
      [50,50],
      vectorSum(v,[7,2]), 
      false,
      {physical: false},
      targetBlocks[i].color
    )}
  )

  blocks = shuffle(blocks)
  cache1.forEach((v,i) => {
    GAME_MANAGER.instantiate(
      'block'+i,
      './../resources/images/white-block.png',
      [50,50],
      vectorSum(v,[2,1]), 
      true,
      {physical: false, isBlock:true},
      blocks[i].color
    )}
  )

  // initial state & actions
  GAME_MANAGER.state = {
    u: UTIL,
    claw: {
      position: 0,
      block: null,
      move: (v) => GAME_MANAGER.wrappers.move(v), 
      toggle: () => GAME_MANAGER.wrappers.toggle(),
    },
    blocks: blocks.map((b,i) => ({
      id: 'block'+i,
      color: colors.find(c => c.id === b.id).id,
      position: [Math.floor(i/3)+1,i%3]
    })),
    target: targetBlocks.map((b,i) => ({
      id: 'ref'+i,
      color: colors.find(c => c.id === b.id).id,
      position: [Math.floor(i/3)+1,i%3]
    }))
  }
}

gameTick = () => {
  // reset checks
  hasMoved = false
  hasToggled = false

  try{
    GAME_MANAGER.wrappers.update(GAME_MANAGER.state)
    
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
  for (let i = 0; i<9; i++) {
    GAME_MANAGER.deInstantiate('ref'+i, false)
    GAME_MANAGER.deInstantiate('block'+i)
  }
  GAME_MANAGER.deInstantiate('claw')
  GAME_MANAGER.deInstantiate('claw-line')
  GAME_MANAGER.deInstantiate('claw-root')

  console.clear()
  setupWorld()
}

const onSubmit = () => {
  PAGE_MANAGER.submit('2-SheepDog')
}

const notifyError = (err) => {
  PAGE_MANAGER.didEval = false
  GAME_MANAGER.time.paused = true
  console.error(err)
  PAGE_MANAGER.stop()
}