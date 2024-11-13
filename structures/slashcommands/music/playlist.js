const { Client, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'playlist',
    description: 'Manage your playlists',
    options: [
        {
            name: 'create',
            description: 'Create a new playlist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to create',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'delete',
            description: 'Delete a playlist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to delete',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'add',
            description: 'Add one or more songs to a playlist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to add to',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'song',
                    description: 'Comma-separated list of songs to add to the playlist',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'Remove a song from a playlist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to remove from',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'song',
                    description: 'The song to remove from the playlist',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'single',
            description: 'View a specific playlist with paginator',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to view',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'play',
            description: 'Play all songs from a specific playlist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist_name',
                    description: 'The name of the playlist to play',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'shuffle',
                    description: 'Whether to shuffle the playlist before playing',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                },
            ],
        },
    ],

    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const playlistsKey = `playlists_${userId}`;

        switch (subcommand) {
            case 'create': {
                const playlistName = interaction.options.getString('playlist_name');
                const playlists = await db.get(playlistsKey) || {};

                if (playlists[playlistName]) {
                    return interaction.reply({ content: 'This playlist already exists.', ephemeral: true });
                }

                playlists[playlistName] = [];
                await db.set(playlistsKey, playlists);

                return interaction.reply({ content: `Playlist **${playlistName}** created successfully!`, ephemeral: true });
            }

            case 'delete': {
                const playlistName = interaction.options.getString('playlist_name');

                let playlists = await db.get(playlistsKey) || {};
                if (!playlists[playlistName]) {
                    return interaction.reply({ content: 'This playlist does not exist.', ephemeral: true });
                }

                delete playlists[playlistName];
                await db.set(playlistsKey, playlists);
                return interaction.reply({ content: `Deleted playlist **${playlistName}**`, ephemeral: true });
            }

            case 'add': {
                const playlistName = interaction.options.getString('playlist_name');
                const songsInput = interaction.options.getString('song');
                const playlists = await db.get(playlistsKey) || {};

                if (!playlists[playlistName]) {
                    return interaction.reply({ content: 'This playlist does not exist.', ephemeral: true });
                }

                const songs = songsInput.split(',').map(song => song.trim());

                playlists[playlistName].push(...songs);
                await db.set(playlistsKey, playlists);

                return interaction.reply({ content: `Added **${songs.length}** songs to playlist **${playlistName}**.`, ephemeral: true });
            }

            case 'remove': {
                const playlistName = interaction.options.getString('playlist_name');
                const song = interaction.options.getString('song');
                const playlists = await db.get(playlistsKey) || {};

                if (!playlists[playlistName]) {
                    return interaction.reply({ content: 'This playlist does not exist.', ephemeral: true });
                }

                const songIndex = playlists[playlistName].indexOf(song);
                if (songIndex === -1) {
                    return interaction.reply({ content: 'This song is not in the playlist.', ephemeral: true });
                }

                playlists[playlistName].splice(songIndex, 1);
                await db.set(playlistsKey, playlists);

                return interaction.reply({ content: `Removed **${song}** from playlist **${playlistName}**.`, ephemeral: true });
            }

            case 'single': {
                const playlistName = interaction.options.getString('playlist_name');
                const playlists = await db.get(playlistsKey) || {};

                if (!playlists[playlistName]) {
                    return interaction.reply({ content: 'This playlist does not exist.', ephemeral: true });
                }

                const songs = playlists[playlistName];
                const itemsPerPage = 10; 
                let page = 0;

                const generateEmbed = (page) => {
                    const start = page * itemsPerPage;
                    const end = start + itemsPerPage;
                    const songList = songs.slice(start, end).join('\n') || 'No songs on this page.';

                    return new EmbedBuilder()
                        .setTitle(`Playlist: ${playlistName}`)
                        .setDescription(songList)
                        .setFooter({ text: `Page ${page + 1} of ${Math.ceil(songs.length / itemsPerPage)}` })
                        .setColor('#2f3136');
                };

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(songs.length <= itemsPerPage)
                );

                const message = await interaction.reply({ embeds: [generateEmbed(page)], components: [row], fetchReply: true });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'next') {
                        page++;
                    } else if (i.customId === 'prev') {
                        page--;
                    }

                    await i.update({
                        embeds: [generateEmbed(page)],
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('prev')
                                    .setLabel('Previous')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page === 0),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(page >= Math.ceil(songs.length / itemsPerPage) - 1)
                            ),
                        ],
                    });
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });

                break;
            }

                    case 'play': {
            const playlistName = interaction.options.getString('playlist_name');
            const shuffle = interaction.options.getBoolean('shuffle') || false; // Get the shuffle option
            const playlists = await db.get(playlistsKey) || {};

            if (!playlists[playlistName]) {
                return interaction.reply({ content: 'This playlist does not exist.', ephemeral: true });
            }

            const songs = playlists[playlistName];
            if (!songs.length) {
                return interaction.reply({ content: 'The playlist is empty.', ephemeral: true });
            }

            await interaction.deferReply();

            const player = client.riffy.createConnection({
                guildId: interaction.guild.id,
                voiceChannel: interaction.member.voice.channel.id,
                textChannel: interaction.channel.id,
                deaf: true,
            });

            let addedSongs = 0;
            for (const song of songs) {
                try {
                    const resolve = await client.riffy.resolve({ query: song, requester: interaction.member });
                    const { loadType, tracks } = resolve;

                    if (loadType === 'track' || loadType === 'search') {
                        const track = tracks[0];
                        track.info.requester = interaction.member;
                        player.queue.add(track);
                        addedSongs++;
                    }
                } catch (error) {
                    console.error(`Failed to resolve or add song: ${song}`, error);
                    continue;
                }
            }

            if (shuffle) {
                player.queue.shuffle(); // Shuffle the queue if shuffle is true
            }

            const playlistEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Playlist Added')
                .setDescription(`Added **${addedSongs}** songs from playlist **${playlistName}** to the queue.`)
                .setTimestamp();

            await interaction.editReply({ embeds: [playlistEmbed] });

            if (!player.playing && !player.paused && player.queue.size) {
                player.play();
            }

            break;
             }
        }
    },
};
 