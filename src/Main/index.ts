import {Client, Intents} from "discord.js";
import * as dotenv from 'dotenv'

dotenv.config()

if (process.env.PWD && process.env.NODE_ENV) {
    let env: string | undefined;

    switch (process.env.NODE_ENV) {
        case 'production':
            env = "prod"
            break
        case 'development':
            env = "dev"
            break
        default:
            env = undefined
            break
    }

    if (env) {
        dotenv.config({path: `${process.env.PWD}/.env.${env}`})
    }
}

console.log(process.env.SOME_OTHER_INFO)

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
