import {
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandUserOption,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandsSet } from "../bot";
import { ifDev } from "./Methods";

type InteractionTypes = (
	| SlashCommandBooleanOption
	| SlashCommandChannelOption
	| SlashCommandStringOption
	| SlashCommandIntegerOption
	| SlashCommandMentionableOption
	| SlashCommandNumberOption
	| SlashCommandRoleOption
	| SlashCommandUserOption
)[];
export abstract class CommandClass {
	name: string = "<unknown>";
	description: string = "<unknown>";
	options: InteractionTypes = [];
	allowedByDefault = true;
	private loadedOptions = false; // if reload happens, the module should be reinstaniated, so doesn't matter
    private onCommand : (Command : CommandInteraction) => any = () => {};

	AddOptions(Commands: CommandClass[]) {
		// no additional commands after all commands are loaded.
	}

    constructor(name: string, description: string, options: InteractionTypes,allowed=true) {
        this.name = name;
        this.description = description;
        this.options = options;
		this.allowedByDefault = allowed
    }
	private initOptions() {
		if (this.loadedOptions) {
			return;
		} else {
			// this is slow, but it shouldn't matter considering it should only be ran once per command.
			this.AddOptions([...CommandsSet.values()].map(v => v.Instance!));
			this.loadedOptions = true;
		}
	}
	get Builder() {
		this.initOptions();
		let slashBuilder = new SlashCommandBuilder()
		.setName( ifDev(`${this.name} (TEST)`,this.name))
		.setDescription(this.description)
		.setDefaultPermission(ifDev(false,this.allowedByDefault));
		// thanks github copilot :pray:
		for (let opt of this.options) {
			if (opt instanceof SlashCommandBooleanOption) {
				slashBuilder.addBooleanOption(opt);
			} else if (opt instanceof SlashCommandChannelOption) {
				slashBuilder.addChannelOption(opt);
			} else if (opt instanceof SlashCommandStringOption) {
				slashBuilder.addStringOption(opt);
			} else if (opt instanceof SlashCommandIntegerOption) {
				slashBuilder.addIntegerOption(opt);
			} else if (opt instanceof SlashCommandMentionableOption) {
				slashBuilder.addMentionableOption(opt);
			} else if (opt instanceof SlashCommandNumberOption) {
				slashBuilder.addNumberOption(opt);
			} else if (opt instanceof SlashCommandRoleOption) {
				slashBuilder.addRoleOption(opt);
			} else if (opt instanceof SlashCommandUserOption) {
				slashBuilder.addUserOption(opt);
			}
		}
		// console.log(slashBuilder)
		return slashBuilder
	}

    invoke(command : CommandInteraction) {
        this.onCommand(command);
    }
    updateInvoke(callback : (Command : CommandInteraction) => any) {
        this.onCommand = callback;
    }

}
