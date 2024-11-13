const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lowpass',
    description: 'Apply low pass filter to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable low pass filter',
            type: 5,
            required: true,
        },
        {
            name: 'smoothing',
            description: 'Smoothing parameter for low pass filter',
            type: 10,
            required: false,
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const enable = interaction.options.getBoolean('enable');
        const smoothing = interaction.options.getNumber('smoothing') || 1.0;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setLowPass(true, { smoothing });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Low pass filter enabled with smoothing ${smoothing}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setLowPass(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Low pass filter disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
