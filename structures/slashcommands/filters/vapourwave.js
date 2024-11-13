const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vaporwave',
    description: 'Apply vaporwave effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable vaporwave effect',
            type: 5,
            required: true,
        },
        {
            name: 'pitch',
            description: 'Pitch of the vaporwave effect (0.1 - 1.0)',
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
        const pitch = interaction.options.getNumber('pitch') || 0.5;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setVaporwave(true, { pitch });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Vaporwave effect enabled with pitch ${pitch}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setVaporwave(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Vaporwave effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
