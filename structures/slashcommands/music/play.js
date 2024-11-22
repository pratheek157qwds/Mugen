const { Client, CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play a track',
    inVoice: true,
    options: [
        {
            name: 'query',
            description: 'The query to search for',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, interaction, args) => {
        const query = interaction.options.getString('query');

        const player = client.riffy.createConnection({
            guildId: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            deaf: true,
        });

        const resolve = await client.riffy.resolve({ query: query, requester: interaction.member });
        const { loadType, tracks, playlistInfo } = resolve;

        if (loadType === 'playlist') {
            for (const track of resolve.tracks) {
                track.info.requester = interaction.member;
                player.queue.add(track);
            }

            const playlistEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Playlist Added')
                .setDescription(`Added **${tracks.length}** songs from [${playlistInfo.name}](${playlistInfo.uri}) to the queue.`)
                .setTimestamp();

            await interaction.reply({ embeds: [playlistEmbed] });

            if (!player.playing && !player.paused) return player.play();

        } else if (loadType === 'search' || loadType === 'track') {
            const track = tracks.shift();
            track.info.requester = interaction.member;

            player.queue.add(track);

            const minutes = Math.floor(track.info.length / 60000);
            const seconds = Math.floor((track.info.length % 60000) / 1000).toString().padStart(2, '0');

            const trackEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Track Added')
                .setDescription(`Added **[${track.info.title}](${track.info.uri})** to the queue.`)
                .addFields(
                    { name: 'Duration', value: `${minutes}:${seconds} minutes`, inline: true },
                    { name: 'Requested by', value: `${interaction.member}`, inline: true }
                )
                .setTimestamp();

            const thumbnail = typeof track.info.thumbnail === 'string' && track.info.thumbnail.trim() !== ''
                ? track.info.thumbnail
                : interaction.member.user.displayAvatarURL({ dynamic: true, size: 1024 });

            trackEmbed.setThumbnail(thumbnail);

            await interaction.reply({ embeds: [trackEmbed] });

            if (!player.playing && !player.paused) return player.play();

        } else {
            return interaction.reply(`There were no results found for your query.`);
        }
    },
};
