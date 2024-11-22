const { ApplicationCommandOptionType, PermissionsBitField, CommandInteraction, Client } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "unlock",
    description: "Unlocks a channel, allowing members to send messages",

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "I need the 'Manage Channels' permission to unlock this channel.", ephemeral: true });
        }
        
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        try {
            const everyoneRole = interaction.guild.roles.everyone;

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
            console.error("Error unlocking the channel:", error);
            interaction.reply({ content: "An error occurred while unlocking the channel. Please check my permissions and try again.", ephemeral: true });
        }
    }
};
