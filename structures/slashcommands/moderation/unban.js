const { Client, ApplicationCommandOptionType, PermissionsBitField, CommandInteraction } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "unban",
    description: "Unbans a user",
    options: [
        {
            name: "userid",
            description: "User ID of the person to unban",
            required: true,
            type: ApplicationCommandOptionType.String, // Change to String for User ID input
        },
    ],

    run: async (client, interaction) => {
        // Check if the bot has the "Ban Members" permission
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "I need the 'Ban Members' permission to unban users.", ephemeral: true });
        }

        // Check if the user is the bot owner or has the "Ban Members" permission
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.bans.remove(userId);
            interaction.reply({ content: `I have unbanned the user with ID ${userId}` }); // Explicitly mention user ID
        } catch (error) {
            // If the unban fails
            if (error.code === 10026) { // DiscordAPIError code for unknown ban
                interaction.reply({ content: `User with ID ${userId} is not banned.`, ephemeral: true });
            } else {
                console.error("Error unbanning user:", error); 
                interaction.reply({ content: "An error occurred while unbanning the user.", ephemeral: true });
            }
        }
    }
};