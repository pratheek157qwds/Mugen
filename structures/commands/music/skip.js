const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    description: 'Skips the current track',
    aliases: ['sk'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, message, args) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.current) {
            return message.reply('There is no track currently playing.');
        }

        const currentTrack = player.current.info;

        player.stop();

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Track Skipped')
            .setDescription(`**Skipped Track:** [${currentTrack.title}](${currentTrack.uri})`)
            .setThumbnail(currentTrack.thumbnail)
            .addFields(
                { name: 'Duration', value: `${Math.floor(currentTrack.length / 60000)} minutes`, inline: true }
            )
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    },
};
