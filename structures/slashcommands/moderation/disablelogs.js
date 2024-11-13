const { Client, CommandInteraction, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const config = require("../../configuration/index");

module.exports = {
    name: "disable-logs",
    description: "Disables bot logs",
    run: async (client, interaction) => {
        // Check if the bot has the Administrator permission
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "I need the 'Administrator' permission to disable logs.", ephemeral: true });
        }

        // Check if the user is the bot owner or has the Administrator permission
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        try {
            const logChannelId = await db.get(`log_bot_${interaction.guild.id}`);
            if (logChannelId) {
                await db.delete(`log_bot_${interaction.guild.id}`);
                interaction.reply({ content: "Bot logs have been disabled." });
            } else {
                return interaction.reply({ content: "This server does not have a log channel configured.", ephemeral: true });
            }
        } catch (error) {
            console.error("An error occurred while disabling logs:", error); // Log the error for debugging
            interaction.reply({ content: "An error occurred while disabling logs.", ephemeral: true });
        }
    }
};
