const { CommandInteraction, Client, ApplicationCommandOptionType } = require('discord.js');
const config = require('../../configuration/index'); // Assuming you have a config file with developer IDs

module.exports = {
    name: 'leaveserver',
    description: 'Leave a server.',
    botPermissions: ['EMBED_LINKS'], // Adjust as needed
    options: [
        {
            name: 'server_id',
            description: 'ID of the server to leave',
            type: 3,
            required: true,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        // Check if the user is authorized (is a developer)
        if (!config.developers.includes(interaction.user.id)) {
            return interaction.editReply({
                content: 'You are not authorized to use this command.',
                ephemeral: true,
            });
        }

        const serverId = interaction.options.getString('server_id');
        const guild = client.guilds.cache.get(serverId);

        if (!guild) {
            return interaction.editReply({
                content: 'No server found. Please provide a valid server ID.',
                ephemeral: true,
            });
        }

        const guildName = guild.name;
        
        try {
            await guild.leave();
            return interaction.editReply({
                content: `Successfully left \`${guildName}\`.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error leaving guild:', error);
            return interaction.editReply({
                content: `Failed to leave \`${guildName}\`.`,
                ephemeral: true,
            });
        }
    },
};
