import {ApplicationCommand} from "discord.js";
import Command from "./Command";
import {SlashCommandBuilder} from "@discordjs/builders";

export default interface CommandPackage {
    applicationCommand?: ApplicationCommand
    command?: Command,
    slashCommandBuild?: SlashCommandBuilder
}
