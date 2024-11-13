const { Client, CommandInteraction, PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "banlist",
    description: "Shows the list of banned members",

    run: async (client, interaction) => {
        // Check if the bot has Administrator permissions
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ I don't have the necessary permissions (Administrator) to view the ban list.", ephemeral: true });
        }
        
        // Check if the user is the bot owner or has Administrator permissions
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
        }

        try {
            const bans = await interaction.guild.bans.fetch();
            const bannedUsers = bans.map(banInfo => `\nUsername: ${banInfo.user.username}\nReason: ${banInfo.reason || "No reason provided"}`);

            if (bannedUsers.length === 0) {
                return interaction.reply({ content: "There are no banned users on this server.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle("List of Banned Users")
                .setDescription(bannedUsers.join("\n\n")) 
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor("DarkGreen"); 

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("Error fetching ban list:", error); // Log any errors to the console
            interaction.reply({ content: "An error occurred while fetching the ban list.", ephemeral: true });
        }
    }
};
