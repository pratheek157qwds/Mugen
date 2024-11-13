const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tremolo',
    description: 'Apply tremolo effect to the song',
    options: [
        {
            name: 'enable',
            description: 'Enable or disable tremolo effect',
            type: 5,
            required: true,
        },
        {
            name: 'frequency',
            description: 'Frequency of the tremolo effect',
            type: 10,
            required: false,
        },
        {
            name: 'depth',
            description: 'Depth of the tremolo effect',
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
        const frequency = interaction.options.getNumber('frequency') || 1.0;
        const depth = interaction.options.getNumber('depth') || 1.0;

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        if (enable) {
            player.filters.setTremolo(true, { frequency, depth });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Tremolo effect enabled with frequency ${frequency} and depth ${depth}.`);
            return interaction.reply({ embeds: [embed] });
        } else {
            player.filters.setTremolo(false);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Tremolo effect disabled.');
            return interaction.reply({ embeds: [embed] });
        }
    }
};
