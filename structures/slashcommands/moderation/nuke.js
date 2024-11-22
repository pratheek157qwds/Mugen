const { Client, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, CommandInteraction } = require("discord.js");
const config = require("../../configuration/index");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "nuke",
    description: "Recreates a channel, clearing all messages",
    
    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "❌ I don't have permission to manage channels.", ephemeral: true });
        }
        
        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
        }

        const channel = interaction.channel;

        try {
            const newChannel = await channel.clone({ position: channel.rawPosition });

            const embed = new EmbedBuilder()
                .setColor("#f7f7f7")
                .setDescription(`Channel nuked by ${interaction.user.username}`)
                .setImage("https://thumbs.gfycat.com/AlarmedTintedHartebeest-size_restricted.gif")
                .setTimestamp();
            await newChannel.send({ embeds: [embed] });

            const logChannelId = await db.get(`log_bot_${interaction.guild.id}`);
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle("[CHANNEL NUKED]")
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "https://cdn.discordapp.com/attachments/798945891678421044/951585273324650496/discord-logo-white.png")
                        .addFields([
                            { name: 'Channel', value: newChannel.toString() },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})` },
                        ])
                        .setColor("#f7f7f7")
                        .setTimestamp()
                        .setFooter({ text: `${client.user.username} © 2024`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                    logChannel.send({ embeds: [logEmbed] });
                }
            }

            await channel.delete();

        } catch (error) {
            console.error("An error occurred while nuking the channel:", error);
            interaction.reply({ content: "❌ An error occurred while nuking the channel.", ephemeral: true });
        }
    }
};
