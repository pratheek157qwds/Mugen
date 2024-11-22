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

        const player = client.riffy.players.get(interaction.guild.id);

        if (!player || !player.playing) {
            const noTrackEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('No track is currently playing.')
                .setTimestamp();

            return interaction.reply({ embeds: [noTrackEmbed], ephemeral: true });
        }

        const currentTrack = player.current;

        if (time > currentTrack.info.length / 1000) {
            const invalidTimeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('The seek time exceeds the current track duration.')
                .setTimestamp();

            return interaction.reply({ embeds: [invalidTimeEmbed], ephemeral: true });
        }

        player.seek(time * 1000);

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
