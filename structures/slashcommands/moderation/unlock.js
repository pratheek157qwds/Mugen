const { ApplicationCommandOptionType, PermissionsBitField, CommandInteraction, Client } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "unlock",
    description: "Unlocks a channel, allowing members to send messages",

    run: async (client, interaction) => {
        // Check if the bot has the "Manage Channels" permission
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "I need the 'Manage Channels' permission to unlock this channel.", ephemeral: true });
        }
        
        // Check if the user is the bot owner or has the "Manage Channels" permission
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        try {
            // Get the @everyone role from the server
            const everyoneRole = interaction.guild.roles.everyone;

            // Update channel permissions to allow certain actions for @everyone
            await interaction.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: true,
                AddReactions: true,
                SendTTSMessages: true,
                AttachFiles: true,
                CreatePublicThreads: true,
                CreatePrivateThreads: true,
                SendMessagesInThreads: true,
            });

            interaction.reply({ content: "I have successfully unlocked the channel." });
        } catch (error) {
            console.error("Error unlocking the channel:", error); // Log errors for debugging
            interaction.reply({ content: "An error occurred while unlocking the channel. Please check my permissions and try again.", ephemeral: true });
        }
    }
};
