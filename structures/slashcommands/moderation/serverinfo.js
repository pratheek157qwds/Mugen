const { Client, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, CommandInteraction, ButtonStyle, ButtonBuilder, ActionRowBuilder, ChannelType } = require("discord.js");
const config = require("../../configuration/index");
const moment = require("moment");

module.exports = {
    name: "server-info",
    description: "Displays server information",

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: "I don't have permission to send messages in this channel.", ephemeral: true });
        }
        
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        try {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Me')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
                    new ButtonBuilder()
                        .setLabel('Server Support')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://google.com`)
                );

            const embed = new EmbedBuilder()
                .setTitle("Server Information")
                .setDescription(`
                    **Server Information:**

                    > Name: ${interaction.guild.name}
                    > ID: ${interaction.guild.id}
                    > Description: ${interaction.guild.description || "No description set."}
                    > Owner: <@${interaction.guild.ownerId}>
                    > Boosts: ${interaction.guild.premiumSubscriptionCount || 0}
                    > Created: ${moment(interaction.guild.createdAt)}
                    > Verification Level: ${interaction.guild.verificationLevel}

                    **Member Information:**

                    > Bots: ${interaction.guild.members.cache.filter(m => m.user.bot).size}
                    > Total Members: ${interaction.guild.memberCount}

                    **Statistics:**

                    > Categories: ${interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size}
                    > Stages: ${interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice).size}
                    > Voice Channels: ${interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size}
                    > Text Channels: ${interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size}
                    > Roles: ${interaction.guild.roles.cache.size}
                    > Emojis: ${interaction.guild.emojis.cache.size}
                `)
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error("Error fetching server information:", error);
            interaction.reply({ content: "An error occurred while fetching server information.", ephemeral: true });
        }
    }
};
