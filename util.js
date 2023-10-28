const lerp1d = (from, to, l) => from*(1-l)+to*l
const lerp2d = (from, to, l) => [from[0]*(1-l)+to[0]*l, from[1]*(1-l)+to[1]*l]

const arraySum = (a,b) => {
  if (a.length !== b.length) throw "error: trying to sum arrays of different size"
  return a.map((x,i)=> x+b[i])
}

const arraySubtract = (a,b) => {
  if (a.length !== b.length) throw "error: trying to sum arrays of different size"
  return a.map((x,i)=> x-b[i])
}

const sinerp = (from, to, l) => {
  const ll = Math.sin(lerp1d(0, Math.PI / 2, l))
  return [from[0]*(1-ll)+to[0]*ll, from[1]*(1-ll)+to[1]*ll]
}

const clamp = (x, min, max) => x < min ? min : x > max ? max : x

const multiplyVector = (v, x) => v.map(e => e*x)

const coordsToPixels = (coords, manager) => {
  return [
    (coords[0] + 0.5 ) * manager.terrain.cellSize,
    (manager.terrain.size[1] - coords[1] - 0.5) * manager.terrain.cellSize,
  ]
}