const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'join',
    description: 'Joins the voice channel you are in',
    aliases: ['j'],

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const userVoiceChannel = message.member.voice.channel;
        const player = client.riffy.players.get(message.guild.id);

        if (!userVoiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Error')
                .setDescription('Are you dumb? Join a voice channel before using this command.');
            return message.reply({ embeds: [embed] });
        }

        if (player && player.voiceChannel !== userVoiceChannel.id) {
            if (player.current) {
                const embed = new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setTitle('Will Join After Current Track')
                    .setDescription('Will join your voice channel after the current song is completed.');
                await message.reply({ embeds: [embed] });

                player.once('trackEnd', async () => {
                    player.destroy(); // Destroy the current player

                    const newPlayer = client.riffy.createConnection({
                        guildId: message.guild.id,
                        voiceChannel: userVoiceChannel.id,
                        textChannel: message.channel.id,
                        deaf: true,
                    });

                    const joinEmbed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Joined Voice Channel')
                        .setDescription(`Joined **${userVoiceChannel.name}**.`);
                    await message.channel.send({ embeds: [joinEmbed] });
                });
            } else {
                player.destroy(); // Destroy the current player

                const newPlayer = client.riffy.createConnection({
                    guildId: message.guild.id,
                    voiceChannel: userVoiceChannel.id,
                    textChannel: message.channel.id,
                    deaf: true,
                });

                const embed = new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setTitle('Joined Voice Channel')
                    .setDescription(`Joined **${userVoiceChannel.name}**.`);
                return message.reply({ embeds: [embed] });
            }
        } else {
            client.riffy.createConnection({
                guildId: message.guild.id,
                voiceChannel: userVoiceChannel.id,
                textChannel: message.channel.id,
                deaf: true,
            });

            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setTitle('Joined Voice Channel')
                .setDescription(`Joined **${userVoiceChannel.name}**.`);
            return message.reply({ embeds: [embed] });
        }
    },
};
