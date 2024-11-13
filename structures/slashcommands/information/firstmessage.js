const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'firstmsg',
    description: 'Fetch and display the first message in the channel.',
    category: 'info',
    options: [],

    run: async (client, interaction) => {
        const clientColor = client.color || '#FFFFFF'; // Set a default color if client.color is undefined

        // Fetch the first message in the channel
        const fetchMessages = await interaction.channel.messages.fetch({
            after: 1,
            limit: 1
        });
        const msg = fetchMessages.first();

        // If no message is found
        if (!msg) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(clientColor)
                        .setTitle('Error')
                        .setDescription('No messages found in this channel.')
                ],
                ephemeral: true
            });
        }

        // Create the embed for the first message
        const embed = new EmbedBuilder()
            .setTitle(`First Message in ${interaction.guild.name}`)
            .setURL(msg.url)
            .setDescription('Content: ' + msg.content)
            .addFields(
                { name: 'Author', value: `${msg.author}`, inline: true },
                { name: 'Message ID', value: `${msg.id}`, inline: true },
                { name: 'Created At', value: `${msg.createdAt.toLocaleDateString()}`, inline: true }
            )
            .setColor(clientColor);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    }
};