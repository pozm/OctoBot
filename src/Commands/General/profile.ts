import { CommandsSet } from "./../../bot";
import {
	SlashCommandStringOption,
	SlashCommandUserOption,
} from "@discordjs/builders";
import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import { FetchCommandByNameOrAlias } from "../../Utils/Methods";
import { CommandClass } from "./../../Utils/CommandClass";
import { createCanvas, Image, SKRSContext2D } from "@napi-rs/canvas";
import axios from "axios";
import { readFileSync } from "fs";
import { join } from "path";
export default class ProfileCommand extends CommandClass {

    vulnusIcon : Image = new Image();

	constructor() {
		super("profile", "Displays a users profile", [
			new SlashCommandUserOption()
				.setRequired(false)
				.setName("user")
				.setDescription("pog"),
		]);
        this.vulnusIcon.src = readFileSync(join(process.cwd(), "../assets/octo_ico.png"));
	}

    roundRect(ctx:SKRSContext2D,x:number, y:number, width:number, height:number, radius:number) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        return ctx;
    }

    MakeFontSmaller(ctx:SKRSContext2D,text:string,currentpx:number,desiredWidth:number) {
        ctx.font = `${currentpx}px sans-serif`;
        let size = ctx.measureText(text);
        while (size.width > desiredWidth) {
            currentpx--;
            ctx.font = `${currentpx}px sans-serif`;
            size = ctx.measureText(text);
        }
    }

	override async invoke(command: CommandInteraction<CacheType>) {
		let canvas = createCanvas(800, 250);
		let ctx = canvas.getContext("2d");

		let targettedUser = await (command.options.getUser("user") ?? command.user).fetch();

		let profileInfo: { ranking: number; pp: number } | undefined;

		this.roundRect(ctx, 10, 10, 780, 230, 10)
        ctx.fillStyle = "#1c1c1c";
        ctx.fill();
        ctx.save();
        ctx.clip();
        // ctx.save
        //
        // ctx.globalCompositeOperation = 'source-in';
        // console.log((await targettedUser.fetch()).hexAccentColor)
        let grd = ctx.createLinearGradient(0,0,340,0);
        grd.addColorStop(0,`${targettedUser.hexAccentColor}a4`);
        // grd.addColorStop(0,`${targettedUser.hexAccentColor}a4`);
        grd.addColorStop(1,"#00000000");
        
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,340,canvas.height);
        //
        ctx.globalCompositeOperation = "source-over";

        // ctx.restore();
        ctx.strokeStyle = "#424242";
        ctx.lineWidth = 2;
        ctx.stroke()

//
        this.roundRect(ctx, 280, (canvas.height/2)-((230/2)/2), 1.5, 230/2, 10)
        ctx.fillStyle = "#424242";
        ctx.lineWidth = 1;
        ctx.fill()
        
		// ctx.drawImage(backgroundBorder, 0, 0, canvas.width, canvas.height);

		ctx.font = "54px sans-serif"; //applyText(canvas, `${display}!`);
		ctx.fillStyle = "#c6c6c6";
        let desiredText = `${targettedUser.username}'s profile`
        this.MakeFontSmaller(ctx,desiredText,54,(780-100-60) - 280+30);
		ctx.fillText(desiredText, 280+30, 88);

		if (profileInfo != null) {
			ctx.font = "34px sans-serif";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(`Rank: #${profileInfo.ranking}`, 280+30, 126);

			var rankw = ctx.measureText("Rank:").width;
			var ppw = ctx.measureText("PP:").width;

			ctx.font = "34px sans-serif";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(`PP: ${profileInfo.pp}`, 280 + (rankw - ppw), 164);
		} else {
			ctx.font = "36px sans-serif"; //applyText(canvas, `${display}!`);
			ctx.fillStyle = "#a5a5a5";
			ctx.fillText(`No Info`, 280+40, 146);
		}
		//
        
        ctx.save
		ctx.beginPath();
		ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = "#303030";
		ctx.fill();
		ctx.strokeStyle = "#4c4c4c";
        ctx.lineWidth = 2
		ctx.stroke();
		ctx.clip();

		let avatarUrl = targettedUser.displayAvatarURL({ format: "png" });
        let avatarImg = new Image();
        avatarImg.src = await axios.get(avatarUrl, { responseType: "arraybuffer"}).then(v=>Buffer.from(v.data))
        ctx.drawImage(avatarImg, 25, 25, 200, 200);


        ctx.restore()
        ctx.drawImage(this.vulnusIcon, 780-100, 25, 100, 100);
//
		let canvasExport = await canvas.toBuffer("image/png");//
//g
		command.reply({ files: [canvasExport], content: "pog" });
	}
}
