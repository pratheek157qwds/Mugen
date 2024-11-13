const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'seek',
    description: 'Seek to a specific time in the currently playing track',
    inVoice: true,
    options: [
        {
            name: 'time',
            description: 'The time to seek to (in seconds)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        }
    ],

    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        const time = interaction.options.getInteger('time');

        // Fetch the player connection for the guild
        const player = client.riffy.players.get(interaction.guild.id); // Adjust this if your client uses a different method for managing players

        // Check if player exists and is currently playing
        if (!player || !player.playing) {
            const noTrackEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('No track is currently playing.')
                .setTimestamp();

            return interaction.reply({ embeds: [noTrackEmbed], ephemeral: true });
        }

        // Get the currently playing track
        const currentTrack = player.current;

        // Check if the seek time is valid
        if (time > currentTrack.info.length / 1000) {
            const invalidTimeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('The seek time exceeds the current track duration.')
                .setTimestamp();

            return interaction.reply({ embeds: [invalidTimeEmbed], ephemeral: true });
        }

        // Perform the seek operation
        player.seek(time * 1000);

        // Respond with success embed
        const seekEmbed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Seek Successful')
            .setDescription(`Seeked to **${time} seconds** in the track **[${currentTrack.info.title}](${currentTrack.info.uri})**.`)
            .addFields(
                { name: 'Requested by', value: `${interaction.member}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [seekEmbed] });
    },
};
