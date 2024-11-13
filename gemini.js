require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const conversationMemory = new Map();
let apiCallCount = 0;
let currentKeyIndex = 0;
const geminiApiKeys = process.env.GEMINI_API_KEYS.split(',');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

const authorizedUsers = process.env.AUTHORIZED_USERS.split(',');
const authorizedChannels = process.env.AUTHORIZED_CHANNELS.split(',');

async function runGeminiPro(prompt, index) {
    const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
}

async function runGeminiVision(prompt, imagePath, mimeType, index) {
    const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const imageParts = [{
        inlineData: {
            data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
            mimeType
        }
    }];
    const result = await model.generateContent([prompt, ...imageParts]);
    return (await result.response).text();
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const conversationId = message.channel.type === ChannelType.DM ? message.author.id : message.channel.id;
    let conversationHistory = conversationMemory.get(conversationId) || [];
    conversationHistory.push({ role: "user", content: message.content });

    const prompt = message.channel.type === ChannelType.DM 
        ? message.content
        : `Conversation History:\n${conversationHistory.map(turn => `${turn.role}: ${turn.content}`).join('\n')}\n\nUser: ${message.content}`;

    let response;

    if (message.attachments.size > 0 && authorizedChannels.includes(message.channel.id)) {
        const attachment = message.attachments.first();
        const localPath = path.join(__dirname, 'image', attachment.name);

        const file = fs.createWriteStream(localPath);
        https.get(attachment.url, function (httpResponse) {
            httpResponse.pipe(file);

            file.on('finish', async function () {
                file.close(async () => {
                    const stats = fs.statSync(localPath);
                    if (stats.size > 3145728) { // 3MB limit
                        message.reply('Image is too large. Please provide an image smaller than 3MB.');
                    } else {
                        try {
                            response = await runGeminiVision(prompt, localPath, attachment.contentType, currentKeyIndex);
                        } catch (error) {
                            console.error(error);
                            message.reply('Error processing image.');
                        }
                    }
                });
            });
        });
    } else if (authorizedUsers.includes(message.author.id) || authorizedChannels.includes(message.channel.id)) {
        response = await runGeminiPro(prompt, currentKeyIndex);
    } else {
        return; 
    }

    apiCallCount++;
    if (apiCallCount >= 60) {
        currentKeyIndex = (currentKeyIndex + 1) % geminiApiKeys.length;
        apiCallCount = 0;
    }

    await message.reply(response); 

    if (!message.attachments.size > 0) {
        conversationHistory.push({ role: "assistant", content: response });
        conversationMemory.set(conversationId, conversationHistory);
    }
});
