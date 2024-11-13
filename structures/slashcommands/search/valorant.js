const { CommandInteraction, Client, ApplicationCommandOptionType } = require('discord.js');
const TeemoJS = require('teemojs');

// Define custom configuration with Valorant endpoints
const customConfig = {
    prefix: 'https://api.riotgames.com',
    endpoints: {
        'val/account/v1/accounts/by-riot-id': '/val/account/v1/accounts/by-riot-id/%s/%s',
        'val/ranked/v1/ranked/players': '/val/ranked/v1/ranked/players/%s',
        'val/match/v1/matches/by-puuid': '/val/match/v1/matches/by-puuid/%s/ids'
    }
};

// Create TeemoJS instance with custom configuration
const api = TeemoJS('RGAPI-88aa9fba-d19a-4df4-9bd9-b0193bbb327e', customConfig);

module.exports = {
    name: 'valorant',
    description: 'Retrieve Valorant player data',
    options: [
        {
            name: 'gametag',
            description: 'Your Valorant gametag',
            required: true,
            type: 3,
        },
        {
            name: 'tagline',
            description: 'Your Valorant tagline',
            required: true,
            type: 3,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const gametag = interaction.options.getString('gametag');
        const tagline = interaction.options.getString('tagline');

        try {
            // Fetch player PUUID using gametag and tagline
            const playerInfo = await api.get('americas', 'val/account/v1/accounts/by-riot-id', gametag, tagline);

            const puuid = playerInfo.puuid;

            // Fetch player data using PUUID
            const playerRank = await api.get('americas', 'val/ranked/v1/ranked/players', puuid);
            const recentMatches = await api.get('americas', 'val/match/v1/matches/by-puuid', puuid);
            
            // You can add more API calls to fetch additional data

            // Extract and format the data you need
            const rank = playerRank.data.currenttierpatched; // Assuming this is the correct field
            const rr = playerRank.data.ranking_in_tier; // Assuming this is the correct field
            const matches = recentMatches.data; // Adjust this based on actual data structure

            // Send the data back to the user
            await interaction.reply({
                content: `Valorant data for ${gametag}#${tagline}`,
                embeds: [
                    {
                        title: `${gametag}#${tagline} - Valorant Data`,
                        description: `Rank: ${rank}\nRR: ${rr}\nRecent Matches: ${matches.join(', ')}`,
                        color: 0x00FF00, // Green color
                        timestamp: new Date(),
                    },
                ],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error fetching Valorant data:', error);
            await interaction.reply({
                content: 'There was an error fetching the Valorant data. Please try again later.',
                ephemeral: true,
            });
        }
    },
};
