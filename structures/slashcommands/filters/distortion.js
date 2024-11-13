const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'distortion',
    description: 'Apply distortion effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable distortion effect',
            type: 5,
            required: true,
        },
        {
            name: 'params',
            description: 'Distortion effect parameters',
            type: 3,
            required: false,
            choices: [
                { name: 'default', value: 'default' },
                { name: 'custom', value: 'custom' },
            ],
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const enable = interaction.options.getBoolean('enable');
        const params = interaction.options.getString('params');

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            if (params === 'custom') {
                // Adjust parameters as needed
                player.filters.setDistortion(true, {
                    sinOffset: 1,
                    sinScale: 1,
                    cosOffset: 1,
                    cosScale: 1,
                    tanOffset: 1,
                    tanScale: 1,
                    offset: 1,
                    scale: 1
                });
            } else {
                player.filters.setDistortion(true);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('Distortion effect enabled.');
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setDistortion(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Distortion effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
