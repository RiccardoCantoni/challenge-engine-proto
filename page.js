PAGE_MANAGER = {
  didEval: false,
  init () {
    this.buttonRun = document.getElementById('buttonRun')
    this.buttonStep = document.getElementById('buttonStep')
    this.buttonReset = document.getElementById('buttonReset')
    this.editor = ace.edit('editor')
    this.editor.setTheme("ace/theme/monokai")
    this.editor.session.setMode("ace/mode/javascript")
    this.editor.session.setTabSize(2)
    this.editorDiv = document.getElementById('editor')
  },
  step () {
    this.editor.setReadOnly(true)
    this.editorDiv.classList.add('disabled')
  },
  run () {
    this.buttonRun.classList.add('buttonPressed')
    this.buttonStep.disabled = true
    this.editor.setReadOnly(true)
    this.editorDiv.classList.add('disabled')
  },
  pause () {
    this.buttonRun.classList.remove('buttonPressed')
    this.buttonStep.disabled = false
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
  },
  evalCode () {
    if (!this.didEval) {
      eval(this.editor.getValue())
      eval('GAME_MANAGER.wrappers.update = (worldState) => update(worldState)')
      this.didEval = true
    }
  }
}