const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'nowplaying',
    description: 'Current Playing Song',
    inVoice: false,
    sameVoice: false,
    player: false,

    run: async (client, interaction) => {
        const player = client.riffy.players.get(interaction.guild.id);

        if (!player || !player.current) {
            const embed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Now Playing')
                .setThumbnail('https://i.imgur.com/ibWt3FD.png')
                .setDescription('There is nothing currently being played.')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .setFooter({ text: 'Queue length: 0 tracks' });

            return interaction.reply({ embeds: [embed] });
        }

        const voiceChannel = interaction.guild.channels.cache.get(player.voiceChannel);
        const currentPosition = player.position; // Current position in the track in milliseconds
        const trackLength = player.current.info.length; // Track length in milliseconds

        // Function to format milliseconds to MM:SS
        const formatTime = (ms) => {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        };

        const currentFormatted = formatTime(currentPosition);
        const totalFormatted = formatTime(trackLength);

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Now Playing')
            .setThumbnail(player.current.info.thumbnail)
            .setDescription(`[${player.current.info.title}](${player.current.info.uri})`)
            .addFields(
                { name: 'Duration', value: `${currentFormatted}/${totalFormatted}`, inline: true },
                { name: 'Voice Channel', value: voiceChannel ? voiceChannel.name : 'Unknown', inline: true },
                { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};
