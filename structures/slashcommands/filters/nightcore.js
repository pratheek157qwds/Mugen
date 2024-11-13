const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nightcore',
    description: 'Apply nightcore effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable nightcore effect',
            type: 5,
            required: true,
        },
        {
            name: 'rate',
            description: 'Rate of nightcore effect (1.0 - 2.0)',
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
        const rate = interaction.options.getNumber('rate') || 1.5;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setNightcore(true, { rate });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Nightcore effect enabled with rate ${rate}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setNightcore(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Nightcore effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
