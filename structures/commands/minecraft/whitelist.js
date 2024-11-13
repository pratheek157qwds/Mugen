const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'whitelist',
    description: 'Whitelist a gamertag',
    aliases: ['wl'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (args.length < 2) {
            return message.reply('You need to provide a gamertag and platform. Usage: `.whitelist <gamertag> <platform>`');
        }

        const gamertag = args[0];
        const platform = args[1].toLowerCase();

        const validPlatforms = ['pe', 'java', 'bedrock'];
        if (!validPlatforms.includes(platform)) {
            return message.reply('Invalid platform. Valid options are: pe, java, bedrock.');
        }

        const channelId = await db.get(`whitelist_channel_${message.guild.id}`);
        if (!channelId) {
            return message.reply('Whitelist channel is not configured. Please contact an admin.');
        }

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
            return message.reply('Whitelist channel not found. Please contact an admin.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Whitelist Request')
            .addFields(
                { name: 'Gamertag', value: gamertag, inline: true },
                { name: 'Platform', value: platform, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('#00FF00');

        await channel.send({ embeds: [embed] });
        await message.reply('Please wait for 10-15 minutes to get whitelisted.');
    },
};
