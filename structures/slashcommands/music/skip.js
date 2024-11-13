const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    description: 'Skips the current track',
    inVoice: true,
    sameVoice: true,
    player: true,
    run: async (client, interaction) => {
        const player = client.riffy.players.get(interaction.guild.id);

        if (!player || !player.current) {
            return interaction.reply({ content: 'There is no track currently playing.', ephemeral: true });
        }

        // Get current track info
        const currentTrack = player.current.info;

        // Stop the player
        player.stop();

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Track Skipped')
            .setDescription(`**Skipped Track:** [${currentTrack.title}](${currentTrack.uri})`)
            .setThumbnail(currentTrack.thumbnail)
            .addFields(
                { name: 'Duration', value: `${Math.floor(currentTrack.length / 60000)} minutes` } // Display duration in minutes
            );

        // Send the response
        return interaction.reply({ embeds: [embed] });
    },
};