const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'karaoke',
    description: 'Apply karaoke filter to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable karaoke filter',
            type: 5,
            required: true,
        },
        {
            name: 'options',
            description: 'Karaoke filter options',
            type: 3,
            required: false,
            choices: [
                { name: 'Level 1', value: 'level1' },
                { name: 'Level 2', value: 'level2' },
                { name: 'Custom', value: 'custom' },
            ],
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const enable = interaction.options.getBoolean('enable');
        const option = interaction.options.getString('options');

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            if (option === 'custom') {
                // Adjust parameters as needed
                player.filters.setKaraoke(true, {
                    level: 1,
                    monoLevel: 1,
                    filterBand: 1,
                    filterWidth: 1
                });
            } else {
                player.filters.setKaraoke(true);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('Karaoke filter enabled.');
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setKaraoke(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Karaoke filter disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
