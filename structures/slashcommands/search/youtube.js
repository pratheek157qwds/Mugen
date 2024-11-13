const { CommandInteraction, Client, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'youtube',
    description: 'Search YouTube videos',
    options: [
        {
            name: 'name',
            description: 'Name of the video to search for',
            required: true,
            type: 3, // 3 corresponds to ApplicationCommandOptionType.STRING
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const name = encodeURIComponent(interaction.options.getString('name'));
        const link = `https://www.youtube.com/results?search_query=${name}`;

        await interaction.reply({
            content: `I have found the following for: \`${name}\``,
            embeds: [
                {
                    title: `YouTube Search Results`,
                    description: `Click [here](${link}) to see the search results for: \`${name}\``,
                    color: 0xFF5733, // Orange color
                    fields: [
                        {
                            name: 'Search Query',
                            value: name,
                            inline: true,
                        },
                        {
                            name: 'Result Link',
                            value: `[Click here to see the link](${link})`,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'YouTube Search',
                        icon_url: 'https://cdn.freebiesupply.com/logos/large/2x/youtube-2-logo-png-transparent.png',
                    },
                    timestamp: new Date(),
                },
            ],
            ephemeral: true,
        });
    },
};
