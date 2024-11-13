const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clearqueue',
    description: 'Clears all songs in the queue except the current playing song',
    aliases: ['cq'],

    /**
     * @param {Client} client
     * @param {Message} messages
     * @param {String[]} args
     */
    run: (client, message, args) => {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.current) {
            const embed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Error')
                .setDescription('Are you dumb? There is nothing currently being played.');
            return message.reply({ embeds: [embed] });
        }

        player.queue.clear(); // Clears the queue while keeping the current song

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Queue Cleared')
            .setDescription('The queue has been cleared, but the current song will continue playing.');
        return message.reply({ embeds: [embed] });
    },
};
