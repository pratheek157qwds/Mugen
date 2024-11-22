const { Client, Message, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'autoplay',
    description: 'Toggle autoplay mode',
    inVoice: true,
    aliases: ['ap'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async (client, message, args) => {
        const player = client.riffy.players.get(message.guild.id);
        if (!player) {
            return message.reply('There is no active player in this guild.');
        }

        const enabledEmbed = new EmbedBuilder()
            .setColor("#2f3136")
            .setDescription("<a:mugen_on:1276591628584222832> Autoplay has been enabled.");

        const disabledEmbed = new EmbedBuilder()
            .setColor("#2f3136")
            .setDescription("<a:mugen_off:1276589039708803153> Autoplay has been disabled.");

        
        if (player.isAutoplay) {
            player.isAutoplay = false;
            return message.channel.send({ embeds: [disabledEmbed] });
        } else {
            player.isAutoplay = true;
            return message.channel.send({ embeds: [enabledEmbed] });
        }
    },
};
