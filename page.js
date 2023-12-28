PAGE_MANAGER = {
  didEval: false,
  init (gm) {
    this.buttonRun = document.getElementById('buttonRun')
    this.buttonRunFast = document.getElementById('buttonRunFast')
    this.buttonStep = document.getElementById('buttonStep')
    this.buttonReset = document.getElementById('buttonReset')
    this.editor = ace.edit('editor')
    this.editor.setTheme("ace/theme/monokai")
    this.editor.session.setMode("ace/mode/javascript")
    this.editor.session.setTabSize(2)
    this.editorDiv = document.getElementById('editor')
    this.modal = document.getElementById('modalScreen')
    document.getElementById('pixi').appendChild(gm.pixiApp.view)
    document.getElementById('pixi').style.height = gm.terrain.size[1] * gm.terrain.cellSize
    document.getElementById('pixi').style.width = gm.terrain.size[0] * gm.terrain.cellSize
  },
  enableButtons(buttons){
    buttons.forEach(b => { if(this[b]) this[b].disabled = false })
  },
  disableButtons(buttons){
    buttons.forEach(b => { if(this[b]) this[b].disabled = true })
  },
  pressButtons(buttons){
    buttons.forEach(b => { if(this[b]) this[b].classList.add('buttonPressed') })
  },
  unpressButtons(buttons){
    buttons.forEach(b => { if(this[b]) this[b].classList.remove('buttonPressed') })
  },
  setEditorEnabled(enabled) {
    this.editor.setReadOnly(!enabled)
    if (enabled) {
      this.editorDiv.classList.remove('disabled')
    } else {
      this.editorDiv.classList.add('disabled')
    }
  },
  step () {
    this.setEditorEnabled(false)
  },
  run () {
    this.pressButtons(['buttonRun'])
    this.disableButtons(['buttonStep','buttonRunFast'])
    this.setEditorEnabled(false)
  },
  runFast () {
    this.pressButtons(['buttonRunFast'])
    this.disableButtons(['buttonStep', 'buttonRun'])
    this.setEditorEnabled(false)
  },
  pause () {
    this.unpressButtons(['buttonRun','buttonRunFast', 'buttonStep'])
    this.enableButtons(['buttonStep','buttonRun','buttonRunFast'])
  },
  stop () {
    this.unpressButtons(['buttonRun','buttonStep'])
    this.disableButtons(['buttonRun','buttonStep'])
  },
  reset () {
    this.didEval = false
    this.enableButtons(['buttonStep','buttonRun','buttonRunFast'])
    this.unpressButtons(['buttonStep','buttonRun','buttonRunFast'])
    this.setEditorEnabled(true)
    this.modal.style.display = 'none'
  },
  evalCode () {
    if (!this.didEval) {
      try {
        eval(this.editor.getValue())
        eval('GAME_MANAGER.wrappers.update = (worldState) => update(worldState)')
        this.didEval = true
      } catch (e) {
        console.error('an error occurred while evaluating your code:', e)
        stop()
      }
    }
  },
  openWinScreen () {
    this.stop()
    this.modal.style.display = 'flex'
  },
  submit (challengeName) {
    navigator.clipboard.writeText(this.editor.getValue())
    window.open(
      `mailto:rcantoni@deloitte.it
      ?subject=Challenge submission for: ${challengeName}
      &body=${encodeURI('your code has been copied to your clipboard. please paste it below this line:\n========')}`
    )
  }
}