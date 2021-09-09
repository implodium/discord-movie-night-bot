import {Client, Intents} from "discord.js";
import * as dotenv from 'dotenv'
import * as config from 'config'

if (process.env.NODE_ENV) {
    console.log(process.env.NODE_ENV)
    process.env.NODE_CONFIG_DIR = `${process.cwd()}/config/app`
    config.util.loadFileConfigs()
    console.log(config.util.getConfigSources());
}

if (process.env.NODE_ENV && process.env.PWD && process.env.NODE_ENV === 'development') {
    dotenv.config({path: `${process.env.PWD}/config/env/.env.dev`})
}

const client = new Client({intents: Intents.FLAGS.GUILDS});
const token = process.env.DISCORD_TOKEN

if (token) {
    console.log(token)

    client.login(process.env.DISCORD_TOKEN)
        .catch(console.log)
}

client.on('ready', () => {
    if (client.user) {
        console.log(`logged in as ${client.user.tag}`)
    }
})
