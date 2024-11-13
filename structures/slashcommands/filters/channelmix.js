const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'channelmix',
    description: 'Apply channel mix effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable channel mix effect',
            type: 5,
            required: true,
        },
        {
            name: 'params',
            description: 'Channel mix effect parameters',
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
                player.filters.setChannelMix(true, {
                    leftToLeft: 1,
                    leftToRight: 1,
                    rightToLeft: 1,
                    rightToRight: 1
                });
            } else {
                player.filters.setChannelMix(true);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('Channel mix effect enabled.');
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setChannelMix(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Channel mix effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
