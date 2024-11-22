const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    description: 'Loop the current track or the entire queue',
    usage: '[none | song | queue]',
    args: false,

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const modes = {
            none: 'none',
            song: 'track',
            queue: 'queue'
        };

        if (!args.length) {
            return message.channel.send('Please specify a loop mode: `none`, `song`, or `queue`.');
        }

        const mode = args[0].toLowerCase();

        if (!modes[mode]) {
            return message.channel.send('Invalid loop mode specified. Please use `none`, `song`, or `queue`.');
        }

        const player = client.riffy.players.get(message.guild.id);
        if (!player) {
            return message.channel.send('No music is being played!');
        }

        const loopMode = modes[mode];
        player.setLoop(loopMode);

        const loopEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Loop Mode Updated')
            .setDescription(`The loop mode has been set to **${mode}**.`);

        return message.channel.send({ embeds: [loopEmbed] });
    },
};
