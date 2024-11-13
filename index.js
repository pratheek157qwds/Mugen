require('dotenv').config();
const config = require("./structures/configuration/index");
const { ShardingManager, ShardEvents, Client, GatewayIntentBits, ChannelType, Partials, Collection } = require("discord.js");
const { logger } = require("./structures/functions/logger");
const retry = require("./retry");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const fs = require("fs");
const path = require('path');
const https = require('https');
const { runGeminiPro, runGeminiVision, geminiApiKeys } = require('./gemini.js');

let apiCallCount = 0;
let currentKeyIndex = 0;

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    logger("Unhandled promise rejection", "error");
    logger(error.stack, "error");
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    logger("Uncaught exception", "error");
    logger(error.stack, "error");
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

client.commands = new Collection();
client.db = db;

// Load your command files and other setup here

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return;

        // Counting Game Logic (only in guilds)
        if (message.guild) {
            let counter = await client.db.get(`guild_${message.guild.id}.counter`);
            if (!counter) {
                counter = {
                    channel: "",
                    current_number: 0,
                    last_user: ""
                };
                await client.db.set(`guild_${message.guild.id}.counter`, counter);
            }

            const channel = counter.channel;
            const latest_user = counter.last_user;
            const number = counter.current_number;

            if (message.channel.id !== channel) return;
            if (message.author.id == latest_user) {
                return message.react('❌');
            }
            if (parseInt(message.content) !== number + 1) {
                return message.react('❌');
            }

            counter.current_number += 1;
            counter.last_user = message.author.id;
            await client.db.set(`guild_${message.guild.id}.counter`, counter);
            message.react('✅');
        }

        // Gemini API Logic
        const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',');
        const authorizedChannels = process.env.AUTHORIZED_CHANNELS?.split(',');

        if (message.channel.type === ChannelType.DM && authorizedUsers?.includes(message.author.id)) {
            // ... (Gemini Pro API response generation) ...
        }

        if (message.channel.type === ChannelType.GuildText && authorizedChannels?.includes(message.channel.id)) {
            if (!message.mentions.users.has(client.user.id)) return;

            const userId = message.author.id;
            await message.reply(`Hey there, @${userId} how can I help you?`);

            const prompt = message.content;
            let localPath = null;
            let mimeType = null;

            // ... (Gemini Vision or Gemini Pro API response generation based on attachment) ...
        }
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

function splitResponse(response) {
    const maxChunkLength = 2000;
    let chunks = [];
    for (let i = 0; i < response.length; i += maxChunkLength) {
      chunks.push(response.substring(i, i + maxChunkLength));
    }
    return chunks;  
}
// ... Sharding and database connection logic ...

if (config.sharding) {
        const manager = new ShardingManager("./structures/client.js", { token: config.client_token, totalShards: "auto" });

        manager.on("shardCreate", shard => {
            logger(`Launched shard ${shard.id}`, "info");
        });
        manager.on(ShardEvents.Error, (shard, error) => {
            logger(`Shard ${shard.id} encountered an error: ${error.message}`, "error");
        });
        manager.on(ShardEvents.Reconnecting, (shard) => {
            logger(`Shard ${shard.id} is reconnecting.`, "info");
        });
        manager.on(ShardEvents.Death, (shard) => {
            logger(`Shard ${shard.id} has died.`, "error");
        });
    
        retry(() => manager.spawn()).catch(error => {
        logger(`Failed to spawn shards after retries: ${error.message}`, "error");
    });
} else {
    retry(() => client.login(config.client_token)).catch(error => {
        logger(`Failed to start client after retries: ${error.message}`, "error");
    });
}

if (config.database) {
    retry(() => require("./structures/database/connect").connect()).catch(error => {
        logger(`Failed to connect to database after retries: ${error.message}`, "error");
    });
}
