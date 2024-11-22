const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder , AttachmentBuilder } = require("discord.js");
const { Dynamic } = require("musicard");
const client = require("../../client");

client.riffy.on('trackStart', async (player, track) => {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('disconnect')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:stop:1191764297542545569>'),

            new ButtonBuilder()
                .setCustomId('pause')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:pause:1191764245864525954>'),

            new ButtonBuilder()
                .setCustomId('skip')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:skip:1224272565237715014>'),

            new ButtonBuilder()
                .setCustomId('volume_down')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:volumedown:1224269238190080040>'),

            new ButtonBuilder()
                .setCustomId('volume_up')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:volumeup:1224268333856063539>')
        );

    const channel = client.channels.cache.get(player.textChannel);

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    const musicLength = track.info.length;
    const formattedLength = formatTime(Math.round(musicLength / 1000));
    const [minutesStr, secondsStr] = formattedLength.split(":");
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
    const totalMilliseconds = (minutes * 60 + seconds) * 1000;

    const rowDisabled = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('disconnect')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:stop:1191764297542545569>')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('pause')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:pause:1191764245864525954>')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('skip')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:skip:1224272565237715014>')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('volume_down')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:volumedown:1224269238190080040>')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('volume_up')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:volumeup:1224268333856063539>')
                .setDisabled(true)
        );

    const musicard = await Dynamic({
        thumbnailImage: track.info.thumbnail,
        name: track.info.title,
        author: `PPR ${track.info.author}`,
        endTime: formattedLength,
        progress: 69
    });

     // const card = new muzicard()
    //     .setName(track.info.title)
    //     .setAuthor(track.info.author) // Use 'author' (lowercase) if that's the property in your track object
    //     .setColor("auto")
    //     .setTheme("anime")
    //     .setBrightness(999999999999)
    //     .setProgress(69)
    //     .setStartTime("0:00")
    //     .setEndTime(formattedLength)
    //     .setThumbnail(track.info.thumbnail || client.user.displayAvatarURL()); // Fallback to bot's avatar
    // const card = await classicCard({
    //     imageBg: track.info.thumbnail,
    //     imageText: track.info.title,
    //     trackstream: false,
    //     trackduration: 22000,
    //     trackTotalDuration: musicLength,
    // });

    // const musicard = await card.build(); // Get the image buffer from the card
    
    const msg = await channel.send({
        files: [{
            attachment: musicard,
            name: "music_card.png"
        }],
        components: [row]
    });

    setTimeout(async () => {
        return await msg.edit({
            components: [rowDisabled]
        });
    }, totalMilliseconds);
});
