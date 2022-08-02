import { EventsSet } from './../../bot';
import { CommandsSet } from '../../bot';
import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, CacheType } from 'discord.js';
import { FetchCommandByNameOrAlias } from '../../Utils/Methods';
import { CommandClass } from '../../Utils/CommandClass';
import { createCanvas } from '@napi-rs/canvas';
import {DateFns, Versioning} from 'native-utils-octo'
export default class StatsCommand extends CommandClass {
    
    constructor() {
        super('invite', 'Generate an invite', []);
    }
    
    override async invoke(command: CommandInteraction<CacheType>) {
        console.log("invoke invite")
    }

}