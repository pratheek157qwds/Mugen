const { Client, CommandInteraction } = require('discord.js');

module.exports = {
    name: 'volume',
    description: 'Change volume of the player',
    options: [
        {
            name: 'volume',
            description: 'Volume level (0-100)',
            type: 10,
            required: true,
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const volume = interaction.options.getNumber('volume');

        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: 'Volume must be between 0 and 100.', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        player.setVolume(volume);

        return interaction.reply({ content: `Volume set to ${volume}.`, ephemeral: true });
    }
};
