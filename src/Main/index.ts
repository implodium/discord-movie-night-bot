import {Client, Intents} from "discord.js";
import * as dotenv from 'dotenv'

dotenv.config({})

const client = new Client({intents: Intents.FLAGS.GUILDS})

client.login(process.env.DISCORD_TOKEN)
    .catch(console.log)

client.on('ready', () => {
    if (client.user) {
        console.log(`logged in as ${client.user.tag}`)
    }
})
