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
  step () {
    this.editor.setReadOnly(true)
    this.editorDiv.classList.add('disabled')
  },
  run () {
    this.buttonRun.classList.add('buttonPressed')
    this.buttonStep.disabled = true
    this.buttonRunFast.disabled = true
    this.editor.setReadOnly(true)
    this.editorDiv.classList.add('disabled')
  },
  runFast () {
    this.buttonRunFast.classList.add('buttonPressed')
    this.buttonStep.disabled = true
    this.buttonRun.disabled = true
    this.editor.setReadOnly(true)
    this.editorDiv.classList.add('disabled')
  },
  pause () {
    this.buttonRun.classList.remove('buttonPressed')
    this.buttonRunFast.classList.remove('buttonPressed')
    this.buttonStep.disabled = false
    this.buttonRun.disabled = false
    this.buttonRunFast.disabled = false
  },
  stop () {
    this.buttonRun.classList.remove('buttonPressed')
    this.buttonRun.disabled = true
    this.buttonStep.classList.remove('buttonPressed')
    this.buttonStep.disabled = true
  },
  reset () {
    this.didEval = false
    this.buttonStep.disabled = false
    this.buttonRun.disabled = false
    this.buttonRun.classList.remove('buttonPressed')
    this.editor.setReadOnly(false)
    this.editorDiv.classList.remove('disabled')
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