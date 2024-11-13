const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays the list of available commands',

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const prefix = '.';

        const mainEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Help')
            .setDescription(`Hello! I am your all-in-one bot. My prefix is ${prefix} and /.`)
            .addFields({ name: 'Command Categories', value: 'Select a category from the dropdown menu below to view its commands.' })
            .setFooter({ text: 'Use the buttons below for support or to invite me to your server!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Select a category')
                    .addOptions([
                        {
                            label: 'Fun',
                            description: 'Shows fun commands',
                            value: 'fun',
                        },
                        {
                            label: 'Games',
                            description: 'Shows game commands',
                            value: 'games',
                        },
                        {
                            label: 'Moderation',
                            description: 'Shows moderation commands',
                            value: 'moderation',
                        },
                        {
                            label: 'Music',
                            description: 'Shows music commands',
                            value: 'music',
                        },
                        {
                            label: 'Search',
                            description: 'Shows search commands',
                            value: 'search',
                        },
                        {
                            label: 'NSFW',
                            description: 'Shows NSFW commands',
                            value: 'nsfw',
                        },
                        {
                            label: 'Information',
                            description: 'Shows information commands',
                            value: 'information',
                        },
                        {
                            label: 'Filters',
                            description: 'Shows filter commands',
                            value: 'filters',
                        },
                    ]),
            );

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/gfjGN29R72'),
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1245320259217522758&permissions=8&integration_type=0&scope=bot')
            );

        await interaction.reply({
            embeds: [mainEmbed],
            components: [row, buttons],
        });

        const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 240000 });

        collector.on('collect', async i => {
            let embed;
            switch (i.values[0]) {
                case 'fun':
                    embed = getFunEmbed();
                    break;
                case 'games':
                    embed = getGamesEmbed();
                    break;
                case 'moderation':
                    embed = getModerationEmbed();
                    break;
                case 'music':
                    embed = getMusicEmbed();
                    break;
                case 'search':
                    embed = getSearchEmbed();
                    break;
                case 'nsfw':
                    embed = getNsfwEmbed();
                    break;
                case 'information':
                    embed = getInformationEmbed();
                    break;
                case 'filters':
                    embed = getFiltersEmbed();
                    break;
                default:
                    embed = mainEmbed;
            }
            await i.update({ embeds: [embed], components: [row, buttons] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Help command timed out.', components: [] });
            }
        });
    },
};

function getFunEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Fun Commands')
        .setDescription('Here are the fun commands:')
        .addFields(
            { name: '/kiss', value: 'Kiss someone' },
            { name: '/love', value: 'Express love' },
            { name: '/slap', value: 'Slap someone' },
            { name: '/avatar', value: 'Show avatar' },
            { name: '/banner', value: 'Show banner' },
            { name: '/tictactoe', value: 'Play Tic Tac Toe' },
        );
}

function getGamesEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Game Commands')
        .setDescription('Here are the game commands:')
        .addFields(
            { name: '/tictactoe', value: 'Play Tic Tac Toe' },
        );
}

function getModerationEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Moderation Commands')
        .setDescription('Here are the moderation commands:')
        .addFields(
            { name: '/ban', value: 'Ban a member' },
            { name: '/banlist', value: 'Show banned members' },
            { name: '/clear', value: 'Clear messages' },
            { name: '/disable-logs', value: 'Disable logs' },
            { name: '/kick', value: 'Kick a member' },
            { name: '/lock', value: 'Lock a channel' },
            { name: '/set-logs', value: 'Set log channel' },
            { name: '/nuke', value: 'Nuke a channel' },
            { name: '/removeroleall', value: 'Remove a role from everyone' },
            { name: '/role', value: 'Assign a role' },
            { name: '/roleall', value: 'Assign a role to everyone' },
            { name: '/server-info', value: 'Show server info' },
            { name: '/suggestion', value: 'Make a suggestion' },
            { name: '/timeout', value: 'Timeout a member' },
            { name: '/unban', value: 'Unban a member' },
            { name: '/unlock', value: 'Unlock a channel' },
            { name: '/user-info', value: 'Show user info' },
            { name: '/voicedisconnect', value: 'Disconnect user from voice' },
            { name: '/voicemove', value: 'Move user to another voice channel' }
        );
}

function getMusicEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Music Commands')
        .setDescription('Here are the music commands:')
        .addFields(
            { name: '/autoplay', value: 'Toggle autoplay' },
            { name: '/clearqueue', value: 'Clear the queue' },
            { name: '/join', value: 'Join a voice channel' },
            { name: '/leave', value: 'Leave the voice channel' },
            { name: '/loop', value: 'Toggle loop mode' },
            { name: '/move', value: 'Move a track' },
            { name: '/node', value: 'Show node status' },
            { name: '/nowplaying', value: 'Show current track' },
            { name: '/pause', value: 'Pause the track' },
            { name: '/play', value: 'Play a track' },
            { name: '/queue', value: 'Show the queue' },
            { name: '/radio', value: 'Play a radio station' },
            { name: '/resume', value: 'Resume the track' },
            { name: '/serverinvite', value: 'Get server invite link' },
            { name: '/shuffle', value: 'Shuffle the queue' },
            { name: '/skip', value: 'Skip the track' },
            { name: '/skipto', value: 'Skip to a specific track' },
            { name: '/stop', value: 'Stop the track' },
            { name: '/uptime', value: 'Show bot uptime' }
        );
}

function getSearchEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Search Commands')
        .setDescription('Here are the search commands:')
        .addFields(
            { name: '/bingsearch', value: 'Search using Bing' },
            { name: '/crypto', value: 'Get cryptocurrency info' },
            { name: '/steamgame', value: 'Search Steam games' },
            { name: '/weather', value: 'Get weather info' },
            { name: '/youtube', value: 'Search YouTube' }
        );
}

function getNsfwEmbed() {
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('NSFW Commands')
        .setDescription('Here are the NSFW commands:')
        .addFields(
            { name: '/hentai', value: 'Get hentai images' },
            { name: '/wallpaper', value: 'Get NSFW wallpapers' }
        );
}

function getInformationEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Information Commands')
        .setDescription('Here are the information commands:')
        .addFields(
            { name: '/ping', value: 'Check bot latency' },
            { name: '/uptime', value: 'Show bot uptime' }
        );
}

function getFiltersEmbed() {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Filters Commands')
        .setDescription('Here are the filter commands:')
        .addFields(
            { name: '/karaoke', value: 'Apply karaoke filter' },
            { name: '/timescale', value: 'Apply timescale filter' },
            { name: '/tremolo', value: 'Apply tremolo filter' },
            { name: '/vibrato', value: 'Apply vibrato filter' },
            { name: '/rotation', value: 'Apply rotation filter' },
            { name: '/distortion', value: 'Apply distortion filter' },
            { name: '/channelmix', value: 'Apply channelmix filter' },
            { name: '/lowpass', value: 'Apply lowpass filter' },
            { name: '/bassboost', value: 'Apply bassboost filter' },
            { name: '/slowmode', value: 'Apply slowmode filter' },
            { name: '/nightcore', value: 'Apply nightcore filter' },
            { name: '/vaporwave', value: 'Apply vaporwave filter' },
            { name: '/8d', value: 'Apply 8D filter' },
            { name: '/clearfilters', value: 'Clear all filters' }
        );
}
