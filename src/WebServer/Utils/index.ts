import v8 from 'v8'

export function uuidv4 () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}
export class uuid {
	private readonly uuid : string
	constructor() {
		this.uuid =uuidv4()
	}
	toString() {
		return this.uuid;
	}
}
export function Clone(obj : any) {
	return v8.serialize(v8.deserialize(obj))
}
export function arrRemove<t>(array:Array<t>,value:t) {
	let ix = array.indexOf(value)
	return [...array.slice(0,ix),...array.slice(ix+1)]
}

export function splitter (thing : string|{fast_slash:any}|RegExp) : string | string[] {
	if (typeof thing === 'string') {
		return thing.split('/')
	} else if ((thing as any)?.fast_slash) {
		return ''
	} else {
		let match = thing.toString()
			.replace('\\/?', '')
			.replace('(?=\\/|$)', '$')
			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
		return match
			? match[1].replace(/\\(.)/g, '$1').split('/')
			: '<complex:' + thing.toString() + '>'
	}
}