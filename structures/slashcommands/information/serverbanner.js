const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverbanner',
    description: 'Displays the server banner if it exists.',
    category: 'info',

    run: async (client, interaction) => {
        const clientColor = client.color || '#2f3136';

        if (interaction.guild.banner) {
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.guild.name} SERVER BANNER`)
                .setColor(clientColor)
                .setImage(interaction.guild.bannerURL({ size: 4096 }));
            interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setDescription('This Server has no Banner!')
                .setColor(clientColor);
            interaction.reply({ embeds: [embed] });
        }
    }
};
