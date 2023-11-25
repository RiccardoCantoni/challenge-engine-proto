const getRandomInt = (from, to) => Math.floor(from + Math.random() * (to - from))
const getRandomVector = (from, to, size=2) => {
  let v = []
  for (let i = 0; i<size; i++) {
    v.push(getRandomInt(from,to))
  }
  return v
}
const randomPick = (a) => a[getRandomInt(0,a.length)]
const shuffle = a => (a.sort(() => (Math.random() > .5 ? 1 : -1)))

const clamp = (x, min, max) => x < min ? min : x > max ? max : x

const lerp1d = (from, to, l) => from*(1-l)+to*l
const lerp2d = (from, to, l) => [from[0]*(1-l)+to[0]*l, from[1]*(1-l)+to[1]*l]
const sinerp = (from, to, l) => {
  const ll = Math.sin(lerp1d(0, Math.PI / 2, l))
  return [from[0]*(1-ll)+to[0]*ll, from[1]*(1-ll)+to[1]*ll]
}

const vectorSum = (a,b) => {
  if (a.length !== b.length) throw "vectorSum error: trying to sum vectors of different size: "+a.length+' '+b.length
  return a.map((x,i)=> x+b[i])
}
const vectorSubtract = (a,b) => {
  if (a.length !== b.length) throw "vectorSubtract error: trying to subtract vectors of different size "+a.length+' '+b.length
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
const transpose = v => {
  let v2 = []
  v.forEach((_,i) => { v2.push(v[v.length-1-i])})
  return v2
}

const manhattanDistance = (a,b) => {
  if ([...a,...b].find(x => !Number.isInteger(x))) throw "error: manhattanDistance() expectes two vectors of integers"
  if (a.length !== 2 || b.length !== 2) throw "error: manhattanDistance() expectes two vectors of size 2"
  return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])
} 

const vectorMultiply = (v, x) => v.map(e => e*x)

const coordsToPixels = (coords, engine) => {
  return [
    (coords[0] + 0.5 ) * engine.terrain.cellSize,
    (engine.terrain.size[1] - coords[1] - 0.5) * engine.terrain.cellSize,
  ]
}

const isInBoundaries = (coords, engine = GAME_MANAGER) => (
  coords[0] >= 0 &&
  coords[0] < engine.terrain.size[0] &&
  coords[1] >= 0 &&
  coords[1] < engine.terrain.size[1])

const cache1 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,0],[0,1],[1,-1],[1,0],[1,1]]
const cache2 = [
  [-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],
  [-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
  [-2,0],[-1,0],[0,0],[1,0],[2,0],
  [-2,1],[-1,1],[0,1],[1,1],[2,1],
  [-2,2],[-1,2],[0,2],[1,2],[2,2]
]

const textHighlightStyle = {
  fill:['#dee8cf'],
  fontFamily: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', 'source-code-pro'],
  fontSize: 20
}

const UTIL = {
  clamp: clamp,
  lerp1d: lerp1d,
  lerp2d: lerp2d,
  vectorSum: vectorSum,
  vectorSubtract: vectorSubtract,
  vectorEquals: vectorEquals,
  vectorMultiply: vectorMultiply,
  distance: distance,
  transpose: transpose,
  manhattanDistance: manhattanDistance,
  isInBoundaries: isInBoundaries
}


