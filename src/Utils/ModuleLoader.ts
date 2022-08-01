import { Logger } from './Logging';
import { EventsSet } from "./../bot";
import fs, { PathLike, watch } from "fs";
import { platform } from "os";
import path, { join, resolve } from "path";
import { CommandsSet } from "../bot";
import { CommandClass } from "./CommandClass";
import { DiscordEvent, HandledDiscordEvent } from "./Events/DiscordEvent";

export enum EInitType {
	Command,
	Event,
}

export function LoadFromPath(pathTo: string, initType: EInitType) {
	if (!pathTo.endsWith(".js")) return;
	switch (initType) {
		case EInitType.Command:
			{
				CommandsSet.add(new CommandModuleData({ Path: pathTo }));
			}
			break;
		case EInitType.Event:
			{
				EventsSet.add(new EventModuleData({ Path: pathTo }));
			}
			break;
	}
}

export function FindModules(currentPath: string, initType: EInitType) {
	// thanks github copilot!!!
	let dir = fs.readdirSync(currentPath);
	for (let file of dir) {
		let filePath = join(resolve(currentPath), file);
		let stat = fs.lstatSync(filePath);
		if (stat.isDirectory()) {
			FindModules(filePath, initType);
		} else {
			LoadFromPath(filePath, initType);
		}
	}
}

export interface CONSTRUCTOR_BaseModuleData {
	Path: PathLike;
}

abstract class BaseModuleData {
	readonly Path: PathLike;
	readonly FileName: string;
	readonly FileNameNoExt: string;
	readonly SortingFolder: string;

	protected constructor(data: CONSTRUCTOR_BaseModuleData) {
		this.Path = data.Path;
		[this.SortingFolder, this.FileName] = data.Path.toString()
			.split(/\/|\\/)
			.slice(-2); // get last two
		this.FileNameNoExt = this.FileName.slice(0, -3);
	}

	Load() {
		console.warn(
			`no default loader for derived moduledata<${this.constructor.name}>`
		);
	}

	Reload() {
		console.warn(
			`no default reloader for derived moduledata<${this.constructor.name}>`
		);
	}
}

export class CommandModuleData extends BaseModuleData {
	private Command?: CommandClass;
    private _Instance?: CommandClass;
	get CommandClass() {
		return this.Command;
	}
    get Instance() {
    return this._Instance
    }
	constructor(data: CONSTRUCTOR_BaseModuleData) {
		super(data);
		this.Load();
	}

	Load() {
		try {

			delete require.cache[require.resolve(this.Path.toString())] // delete the cache so it can be reloaded
			this._Instance = new (this.Command = require(this.Path.toString()).default as any)();
            Logger.Custom.Command(`loaded ${this.Command?.name}`)
		} catch (e) {
			Logger.Custom.Command(`failed to load command module<${this.FileName}>`);
			Logger.Custom.Command(e);
		}
	}
	Reload(): void {
		this.Load();
	}
}

export class EventModuleData extends BaseModuleData {
	private Events: HandledDiscordEvent[] = [];
	get EventClass() {
		return this.Events;
	}
	constructor(data: CONSTRUCTOR_BaseModuleData) {
		super(data);
		this.Load();
	}
	Load(): void {
		try {
			delete require.cache[require.resolve(this.Path.toString())] // delete the cache so it can be reloaded
			let potentialEvents = Object.values(require(this.Path.toString()));
			for (let module of potentialEvents) {
                try {
                    let loadedModule = new (module as any)() as HandledDiscordEvent;
                    if (loadedModule instanceof HandledDiscordEvent) {
                        this.Events.push(loadedModule);
                        loadedModule.Register();
                        Logger.Custom.Event(`registered ${loadedModule.CustomName}`)
                    }
                } catch(e) {
                    Logger.Custom.Event(`failed to load event module<${this.FileName}>`);
                }
			} 
		} catch (e) {
			Logger.Custom.Event(`failed to load event module<${this.FileName}>`);
			Logger.Custom.Event(e);
		}
	}
	Reload(): void {
		for (let moduleEvent of this.Events) {
			moduleEvent.UnRegister();
            Logger.Custom.Event(`unloading ${moduleEvent.CustomName}`)
		}
		this.Events = [];
		this.Load();
	}
}
