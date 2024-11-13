const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bassboost',
    description: 'Apply bassboost effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable bassboost effect',
            type: 5,
            required: true,
        },
        {
            name: 'value',
            description: 'Bassboost value (1 - 5)',
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
        const value = interaction.options.getNumber('value') || 1;

        if (value < 1 || value > 5) {
            return interaction.reply({ content: 'Bassboost value must be between 1 and 5.', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setBassboost(true, { value });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Bassboost effect enabled with value ${value}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setBassboost(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Bassboost effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
