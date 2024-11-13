const { ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, CommandInteraction, Client } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "lock",
    description: "Locks a channel, preventing most members from sending messages",

    run: async (client, interaction) => {
        // Check if the bot has the "Manage Channels" permission
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "I need the 'Manage Channels' permission to lock this channel.", ephemeral: true });
        }
        
        // Check if the user is the bot owner or has the "Manage Channels" permission
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        try {
            // Get the @everyone role from the server
            const everyoneRole = interaction.guild.roles.everyone;

            // Update channel permissions to deny certain actions for @everyone
            await interaction.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
                AddReactions: false,
                SendTTSMessages: false,
                AttachFiles: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                SendMessagesInThreads: false,
            });

            interaction.reply({ content: "I have successfully locked the channel." });
        } catch (error) {
            console.error("Error locking the channel:", error);
            interaction.reply({ content: "An error occurred while locking the channel. Please check my permissions and try again.", ephemeral: true });
        }
    }
};
