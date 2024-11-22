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

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Error')
                .setDescription('You need to join a voice channel before using this command.');
            return message.reply({ embeds: [embed] });
        }

        if (player && player.voiceChannel !== voiceChannel.id) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Error')
                .setDescription('You must be in the same voice channel as the bot to use this command.');
            return message.reply({ embeds: [embed] });
        }

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Not Connected')
                .setDescription('The bot is not connected to any voice channel.');
            return message.reply({ embeds: [embed] });
        }

        player.destroy(); 

        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle('Left Voice Channel')
            .setDescription('The bot has left the voice channel.');
        return message.reply({ embeds: [embed] });
    },
};
