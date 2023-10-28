const handleRun = () => {
  const inputText = editor.getValue()
  console.log(inputText)
  eval(inputText)
  eval('foo()')
}