import { EventsSet, CommandsSet } from './../bot';
import fs,{ PathLike, watch } from "fs";
import { platform } from "os";
import path, { join } from "path";
import { CommandModuleData, CONSTRUCTOR_BaseModuleData, EventModuleData } from "./ModuleLoader";


interface CONSTRUCTOR_AutoReloader extends CONSTRUCTOR_BaseModuleData {
	Sets: Set<CommandModuleData | EventModuleData>[];
}

export class AutoReloader {
	readonly Watching: PathLike;
	private _Paths: Map<PathLike, number>;

	constructor(watchDir: PathLike) {
		this.Watching = watchDir;
		this._Paths = new Map();
	}

	public Watch() {
		try {
			if (platform() != "win32")
				watch(
					this.Watching,
					{ recursive: true },
					this.OnWatch.bind(this, this.Watching.toString())
				);
			else{
				throw "h"
			}
		}
		catch {
			console.log("CAUGHT")
			this.RunDirectories(this.Watching.toString());
		}
	}

	protected OnWatch(
		xpath: string,
		event: "rename" | "change",
		filename: string
	): void {
		let fn = xpath.toString();
		if (fn.startsWith(`dist${path.sep}`))
			fn = fn.slice(`dist${path.sep}`.length);
		// console.log(fn)
		let isEvent = fn.startsWith("Events");
		let isCommand = fn.startsWith("Commands");
		if (!isEvent && !isCommand) return;

		if (this._Paths.has(filename)) {
			let lastTime = this._Paths.get(filename)!;
			if (Date.now() - lastTime < 2e3) return;
		}
		this._Paths.set(filename, Date.now());
		let flat = [...[EventsSet,CommandsSet].map((set) => [...set])].flat(22);
		let ModData = flat.filter((dat) => dat.Path.toString().includes(fn))[0];
		if (!ModData) return;
		ModData.Reload();
	}

	private RunDirectories(path: string) {
		for (let f of fs.readdirSync(path)) {
			let xp = join(path, "./", f);
			if (fs.statSync(xp).isDirectory()) this.RunDirectories(xp);
			else watch(xp, this.OnWatch.bind(this, xp.toString()));
		}
	}
}
