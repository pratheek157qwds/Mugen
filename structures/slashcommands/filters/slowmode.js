const { Client, CommandInteraction } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Apply slowmode effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable slowmode effect',
            type: 5,
            required: true,
            choices: [
                { name: 'Enable', value: true },
                { name: 'Disable', value: false }
            ],
        },
        {
            name: 'rate',
            description: 'Rate of slowmode effect (0.1 - 1.0)',
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
        const rate = interaction.options.getNumber('rate') || 0.8;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable === true) {
            player.filters.setSlowmode(true, { rate });

            const embedData = {
                color: parseInt('00FF00', 16), // Convert hexadecimal color to integer
                description: `Slowmode effect enabled with rate ${rate}.`
            };
            return interaction.reply({ embeds: [embedData] });
        } else if (enable === false) {
            player.filters.setSlowmode(false);

            const embedData = {
                color: parseInt('FF0000', 16), // Convert hexadecimal color to integer
                description: 'Slowmode effect disabled.'
            };
            return interaction.reply({ embeds: [embedData] });
        } else {
            return interaction.reply({ content: 'Invalid value for enable. Use true to enable or false to disable.', ephemeral: true });
        }
    }
};
