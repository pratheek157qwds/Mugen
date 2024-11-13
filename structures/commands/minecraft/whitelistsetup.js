const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setwhitelistchannel',
    description: 'Set the channel for whitelist requests',
    aliases: ['swlc'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply('You need to mention a channel. Usage: `!setwhitelistchannel #channel`');
        }

        await db.set(`whitelist_channel_${message.guild.id}`, channel.id);
        await message.reply(`Whitelist channel has been set to ${channel}`);
    },
};
