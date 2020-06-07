function range(start: number, end: number): number[] {
    if(start === end) return [start]
    return [start, ...range(start + 1, end)]
}

function l2dist(a: number[], b: number[]): number {
  const r: number[] = range(0, a.length - 1)
  const units: number[] = r.map(x => (a[x] - b[x]) ** 2)
  return units.reduce((a, b) => a + b)
}

function getClosestD(i: number[], data: Array<number[]>): number {
	const options: number[] = data.map(x => l2distNotSelf(i, x))
	return options.reduce((a, b) => Math.min(a,b))
}

function getClosestIndex(i: number[], data: Array<number[]>): number {
  const options: number[] = data.map(x => l2distNotSelf(i, x))
	const closestD: number = options.reduce((a, b) => Math.min(a,b))
  return options.indexOf(closestD)
}

function getClosestPoint(i: number[], data: Array<number[]>): number[] {
  const options: number[] = data.map(x => l2distNotSelf(i, x))
	const closestD: number = options.reduce((a, b) => Math.min(a,b))
  return data[options.indexOf(closestD)]
}

function l2distNotSelf(a: number[], b: number[]): number {
	const raw: number = l2dist(a, b)
	if (raw === 0) {
		return Infinity
	} else {
		return raw
	}
}

function median(values: number[]): number {
	values.sort((a, b) => a - b)
	const lowMiddle: number = Math.floor((values.length - 1) / 2)
	const highMiddle: number = Math.ceil((values.length - 1) / 2)
	return (values[lowMiddle] + values[highMiddle]) / 2
}

function medianLeft(values: number[]): number {
	values.sort((a, b) => a - b)
	const lowMiddle: number = Math.floor((values.length - 1) / 2)
	return lowMiddle
}

function getNDTransform(data: Array<number[]>): number[] {
  return data.map(x => getClosestD(x,data))
}

function alongLine(a: number[], b: number[], d: number): number[] {
  const r: number[] = range(0, a.length - 1)
  const totalDeltas: number[] = r.map(x => b[x] - a[x])
  const newDeltas: number[] = totalDeltas.map(x => x * d)
  return r.map(x => a[x] + newDeltas[x])
}

function crossing(a: number[], b: number[], ndt: number[], data: Array<number[]>, eta: number): boolean {
  const [aNDT, bNDT]: number[] = [a, b].map(x => ndt[data.indexOf(x)])
  const etaRange: number[] = range(1, eta - 1)
  const middleNDTs: number[] = etaRange.map(x => ndt[getClosestIndex(alongLine(a, b, x / eta), data)])
  const minNDTOuter: number = Math.min(aNDT, bNDT)
  const acceptMiddleNDTs: number[] = middleNDTs.filter(x => x < minNDTOuter)
  const deltaMiddleNDT: number = acceptMiddleNDTs.length / middleNDTs.length
  return deltaMiddleNDT >= 1 / 3
}

function sameCluster(a: number[], b: number[], ndt: number[], data: Array<number[]>, eta: number): boolean {
  const [altA, altB]: Array<number[]> = [a, b].map(x => getClosestPoint(x, data))
  const options: Array<Array<number[]>> = [[a, b], [altA, b], [a, altB], [altA, altB]]
  const crossings: boolean[] = options.map(x => crossing(x[0], x[1], ndt, data, eta))
  const nCrossings: number[] = crossings.map(x => x?1:0)
  return (medianLeft(nCrossings)) === 0
}
