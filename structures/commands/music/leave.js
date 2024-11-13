const { Client, Message, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'leave',
    description: 'Leaves the voice channel',
    aliases: ['lv'],

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
                .setTitle('Left Voice Channel')
                .setDescription('Left the voice channel as there was nothing being played.');
            return message.reply({ embeds: [embed] });
        } else if (!player.current) {
            player.destroy();

            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Left Voice Channel')
                .setDescription('Left the voice channel as there was nothing being played.');
            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Leaving After Current Track')
                .setDescription('Will leave the voice channel after the current song is completed.');
            await message.reply({ embeds: [embed] });

            player.once('trackEnd', async () => {
                player.destroy();

                const leaveEmbed = new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setTitle('Left Voice Channel')
                    .setDescription('Left the voice channel after the current song finished.');
                await message.channel.send({ embeds: [leaveEmbed] });
            });
        }
    },
};
