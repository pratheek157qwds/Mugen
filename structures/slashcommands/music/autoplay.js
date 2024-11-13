const { Client, CommandInteraction, EmbedBuilder } = require('discord.js'); 

module.exports = {
    name: 'autoplay',
    description: 'Toggle autoplay mode',
    inVoice: true,

    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        const player = client.riffy.players.get(interaction.guild.id);

        if (!player) {
            return interaction.reply('There is no active player in this guild.');
        }

        // Create embed templates
        const enabledEmbed = new EmbedBuilder()
            .setColor("#2f3136") // Green for enabled
            .setDescription("<a:mugen_on:1276591628584222832> Autoplay has been enabled.");

        const disabledEmbed = new EmbedBuilder()
            .setColor("#2f3136") // Red for disabled
            .setDescription("<a:mugen_off:1276589039708803153> Autoplay has been disabled.");

        // Check if autoplay is currently enabled
        if (player.isAutoplay) {
            player.isAutoplay = false; 
            return interaction.reply({ embeds: [disabledEmbed] });
        } else {
            player.isAutoplay = true;
            return interaction.reply({ embeds: [enabledEmbed] });
        }
    },
};
