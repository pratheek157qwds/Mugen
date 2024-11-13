const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clearfilters',
    description: 'Clear all audio filters from the song',
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        player.filters.clearFilters();

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('All filters cleared.');
        return interaction.reply({ embeds: [embed] });
    }
};
