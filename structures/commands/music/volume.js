const { Client, Message } = require('discord.js');

module.exports = {
    name: 'volume',
    description: 'Change the volume of the player',
    aliases: ['vol'],

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const volume = parseInt(args[0], 10);

        if (isNaN(volume) || volume < 0 || volume > 100) {
            return message.reply({ content: 'Volume must be a number between 0 and 100.', ephemeral: true });
        }

        const player = client.riffy.players.get(message.guild.id);
        if (!player) {
            return message.reply({ content: 'No music is being played!', ephemeral: true });
        }

        player.setVolume(volume);

        return message.reply({ content: `Volume set to ${volume}.`, ephemeral: true });
    }
};
