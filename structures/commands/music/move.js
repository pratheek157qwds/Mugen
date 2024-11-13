const { Client, Message, PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'move',
    description: 'Move the bot to a different voice channel',
    inVoice: true,
    aliases: ['mv'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();

        // Check if the selected channel is a voice channel
        if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Invalid Channel')
                .setDescription('Please select a valid voice channel.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if the bot is currently in a voice channel
        const player = client.riffy.players.get(message.guild.id);
        if (!player || !player.connected) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Not Connected')
                .setDescription('The bot is not currently in a voice channel.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if the bot is already in the selected voice channel
        if (player.voiceChannel === channel.id) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Already in Channel')
                .setDescription('The bot is already in the voice channel you specified.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if the bot has permission to connect to the selected voice channel
        const botMember = await message.guild.members.fetch(client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.Connect) || !botMember.permissions.has(PermissionsBitField.Flags.Speak)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Permission Denied')
                .setDescription('I do not have permission to connect and speak in the selected voice channel.');
            return message.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Move the bot to the new voice channel
            player.setVoiceChannel(channel.id);
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Moved')
                .setDescription(`Moved to **${channel.name}**.`);
            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('An error occurred while processing the move command:', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('An error occurred while processing your request.');
            await message.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
