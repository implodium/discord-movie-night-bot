import {Client, Intents} from "discord.js";
import * as dotenv from 'dotenv'

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

    console.log(`${process.env.PWD}/.env.${env}`)

    if (env) {
        dotenv.config({path: `${process.env.PWD}/.env.${env}`})
    } else {
        dotenv.config()
    }
} else {
    dotenv.config()
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
