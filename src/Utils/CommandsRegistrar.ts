import { client, CommandsSet } from "./../bot";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { CommandClass } from "./CommandClass";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ifProd, isProd } from "./Methods";
export let RestClient: REST | undefined;

export function GetRestClient(): REST {
	if (RestClient) {
		return RestClient;
	}
	return (RestClient = new REST({ version: "9" }).setToken(client.token!));
}

export async function RegisterAll() {
	let r = GetRestClient();
	await r.put(
		Routes.applicationGuildCommands(
			client.user!.id!,
			ifProd(process.env.MAIN_GUILD,process.env.TEST_GUILD)?.toString() ?? ""
		),
		{
			body: [...CommandsSet.values()].map((v) => {
                let commandClass = v.Instance!;
				return commandClass.Builder.toJSON();
			}),
		}
	);
}
