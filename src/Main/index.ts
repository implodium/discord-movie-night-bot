import {Client, Intents} from "discord.js";
import * as dotenv from 'dotenv'

if (process.env.NODE_ENV && process.env.PWD && process.env.NODE_ENV === 'development') {
    dotenv.config({path: `${process.env.PWD}/.env.dev`})
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
