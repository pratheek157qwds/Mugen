const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'seek',
    description: 'Seek to a specific time in the currently playing track',
    aliases: ['sek'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, message, args) => {
        if (!args.length) {
            const noArgsEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('You need to provide a time in seconds to seek to.')
                .setTimestamp();

            return message.channel.send({ embeds: [noArgsEmbed] });
        }

        const { channel } = message.member.voice;
        if (!channel) {
            const noVoiceChannelEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('You need to be in a voice channel to use this command.')
                .setTimestamp();

            return message.channel.send({ embeds: [noVoiceChannelEmbed] });
        }

        const time = parseInt(args[0], 10);
        
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.playing) {
            const noTrackEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('No track is currently playing.')
                .setTimestamp();

            return message.channel.send({ embeds: [noTrackEmbed] });
        }

        const currentTrack = player.current;

        if (time > currentTrack.info.length / 1000) {
            const invalidTimeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Seek Failed')
                .setDescription('The seek time exceeds the current track duration.')
                .setTimestamp();

            return message.channel.send({ embeds: [invalidTimeEmbed] });
        }

        player.seek(time * 1000);

        const seekEmbed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('Seek Successful')
            .setDescription(`Seeked to **${time} seconds** in the track **[${currentTrack.info.title}](${currentTrack.info.uri})**.`)
            .addFields(
                { name: 'Requested by', value: `${message.member}`, inline: true }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [seekEmbed] });
    },
};
