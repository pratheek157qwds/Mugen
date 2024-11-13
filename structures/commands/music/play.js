const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play a track',
    aliases: ['p'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, message, args) => {
        // Check if the user provided a query
        if (!args.length) {
            return message.reply('You need to provide a query to search for.');
        }

        // Check if the user is in a voice channel
        const { channel } = message.member.voice;
        if (!channel) {
            return message.reply('You need to be in a voice channel to use this command.');
        }

        const query = args.join(' ');

        const player = client.riffy.createConnection({
            guildId: message.guild.id,
            voiceChannel: channel.id,
            textChannel: message.channel.id,
            deaf: true,
        });

        const resolve = await client.riffy.resolve({ query: query, requester: message.member });
        const { loadType, tracks, playlistInfo } = resolve;

        if (loadType === 'playlist') {
            for (const track of resolve.tracks) {
                track.info.requester = message.member;
                player.queue.add(track);
            }

            const playlistEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Playlist Added')
                .setDescription(`Added **${tracks.length}** songs from [${playlistInfo.name}](${playlistInfo.uri}) to the queue.`)
                .setTimestamp();

            await message.channel.send({ embeds: [playlistEmbed] });

            if (!player.playing && !player.paused) return player.play();

        } else if (loadType === 'search' || loadType === 'track') {
            const track = tracks.shift();
            track.info.requester = message.member;

            player.queue.add(track);

            const minutes = Math.floor(track.info.length / 60000);
            const seconds = Math.floor((track.info.length % 60000) / 1000).toString().padStart(2, '0');

            const trackEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Track Added')
                .setDescription(`Added **[${track.info.title}](${track.info.uri})** to the queue.`)
                .addFields(
                    { name: 'Duration', value: `${minutes}:${seconds} minutes`, inline: true },
                    { name: 'Requested by', value: `${message.member}`, inline: true }
                )
                .setTimestamp();

            // Set the track thumbnail if available, otherwise use the requester's avatar
            const thumbnail = typeof track.info.thumbnail === 'string' && track.info.thumbnail.trim() !== ''
                ? track.info.thumbnail
                : message.member.user.displayAvatarURL({ dynamic: true, size: 1024 });

            trackEmbed.setThumbnail(thumbnail);

            await message.channel.send({ embeds: [trackEmbed] });

            if (!player.playing && !player.paused) return player.play();

        } else {
            return message.channel.send(`There were no results found for your query.`);
        }
    },
};
