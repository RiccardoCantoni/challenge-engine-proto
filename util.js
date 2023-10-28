const getRandomInt = (from, to) => Math.floor(from + Math.random() * (to - from))
const getRandomVector = (from, to, size=2) => {
  let v = []
  for (let i = 0; i<size; i++) {
    v.push(getRandomInt(from,to))
  }
  return v
}

const clamp = (x, min, max) => x < min ? min : x > max ? max : x

const lerp1d = (from, to, l) => from*(1-l)+to*l
const lerp2d = (from, to, l) => [from[0]*(1-l)+to[0]*l, from[1]*(1-l)+to[1]*l]
const sinerp = (from, to, l) => {
  const ll = Math.sin(lerp1d(0, Math.PI / 2, l))
  return [from[0]*(1-ll)+to[0]*ll, from[1]*(1-ll)+to[1]*ll]
}

const vectorSum = (a,b) => {
  if (a.length !== b.length) throw "error: trying to sum vectors of different size"
  return a.map((x,i)=> x+b[i])
}
const vectorSubtract = (a,b) => {
  if (a.length !== b.length) throw "error: trying to sum vectors of different size"
  return a.map((x,i)=> x-b[i])
}
const vectorEquals = (a,b) => JSON.stringify(a) === JSON.stringify(b)
const vectorMagnitude = (a) => {
  if (a.length !== 2) throw "error: vectorMagnitude() of vectors of size > 2 not supported"
  return (Math.sqrt(a[0]*a[0] + a[1]*a[1]))
}
const distance = (a,b) => {
  return vectorMagnitude(vectorSubtract(a,b))
}
const multiplyVector = (v, x) => v.map(e => e*x)

const coordsToPixels = (coords, manager) => {
  return [
    (coords[0] + 0.5 ) * manager.terrain.cellSize,
    (manager.terrain.size[1] - coords[1] - 0.5) * manager.terrain.cellSize,
  ]
}