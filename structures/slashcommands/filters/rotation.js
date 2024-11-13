const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rotation',
    description: 'Apply rotation effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable rotation effect',
            type: 5,
            required: true,
        },
        {
            name: 'rotationhz',
            description: 'Rotation rate in Hz',
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
        const rotationHz = interaction.options.getNumber('rotationHz') || 1.0;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setRotation(true, { rotationHz });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Rotation effect enabled with rotation rate ${rotationHz} Hz.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setRotation(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Rotation effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
