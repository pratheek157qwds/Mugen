const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'timescale',
    description: 'Apply timescale effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable timescale effect',
            type: 5,
            required: true,
        },
        {
            name: 'speed',
            description: 'Speed of the song (0.5 - 2.0)',
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
        const speed = interaction.options.getNumber('speed') || 1.0;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setTimescale(true, { speed });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Timescale effect enabled with speed ${speed}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setTimescale(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Timescale effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
