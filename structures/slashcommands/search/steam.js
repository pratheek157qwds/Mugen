const { CommandInteraction, Client, ApplicationCommandOptionType } = require('discord.js');
const pop = require("popcat-wrapper");

module.exports = {
    name: 'steamgame',
    description: 'Fetch information about a Steam game',
    options: [
        {
            name: 'name',
            description: 'Name of the game',
            type: 3,
            required: true,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const name = interaction.options.getString('name');

        try {
            const game = await pop.steam(name);

            if (!game || !game.name) {
                return interaction.editReply({ content: 'Game not found!', ephemeral: true });
            }

            const embed = {
                title: `🎮 ${game.name}`,
                description: game.description || 'Description not available',
                thumbnail: {
                    url: game.thumbnail || 'https://example.com/default-thumbnail.png',
                },
                fields: [
                    {
                        name: '💻 Developers',
                        value: game.developers.join(', ') || 'Not specified',
                        inline: true,
                    },
                    {
                        name: '☁ Publishers',
                        value: game.publishers.join(', ') || 'Not specified',
                        inline: true,
                    },
                    {
                        name: '🪙 Price',
                        value: game.price || 'Not specified',
                        inline: true,
                    },
                ],
                footer: {
                    text: 'Powered by popcat-wrapper',
                },
            };

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching Steam game:', error);
            await interaction.editReply({ content: 'Failed to fetch game information. Please try again later.', ephemeral: true });
        }
    },
};
