const { Client, Message, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'disconnect',
    description: 'Disconnects from the voice channel',
    aliases: ['dc'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, message, args) => {
        const player = client.riffy.players.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;

        // Check if the user is in a voice channel
        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Error')
                .setDescription('You need to join a voice channel before using this command.');
            return message.reply({ embeds: [embed] });
        }

        // Check if the bot is in the same voice channel as the user
        if (player && player.voiceChannel !== voiceChannel.id) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Error')
                .setDescription('You must be in the same voice channel as the bot to use this command.');
            return message.reply({ embeds: [embed] });
        }

        // If the bot isn't connected to a player
        if (!player) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Not Connected')
                .setDescription('The bot is not connected to any voice channel.');
            return message.reply({ embeds: [embed] });
        }

        // Destroy the player and disconnect immediately
        player.destroy(); 

        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle('Left Voice Channel')
            .setDescription('The bot has left the voice channel.');
        return message.reply({ embeds: [embed] });
    },
};
