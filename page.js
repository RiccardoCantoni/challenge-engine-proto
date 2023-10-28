PAGE_MANAGER = {
  buttonRun: undefined,
  buttonStep: undefined,
  buttonReset: undefined,
  didEval: false,
  init () {
    this.buttonRun = document.getElementById('buttonRun')
    this.buttonStep = document.getElementById('buttonStep')
    this.buttonReset = document.getElementById('buttonReset')
  },
  run () {
    this.buttonRun.classList.add('buttonPressed')
    this.buttonStep.disabled = true
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
  },
  evalCode () {
    if (!this.didEval) {
      eval(editor.getValue())
      eval('GAME_MANAGER.wrappers.update = (worldState) => update(worldState)')
      this.didEval = true
    }
  }
}