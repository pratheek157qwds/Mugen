const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8d',
    description: 'Apply 8D effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable 8D effect',
            type: 5,
            required: true,
        },
        {
            name: 'rotationhz',
            description: 'Rotation rate for 8D effect',
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
        const rotationHz = interaction.options.getNumber('rotationHz') || 0.2;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.set8D(true, { rotationHz });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`8D effect enabled with rotation rate ${rotationHz}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.set8D(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('8D effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
