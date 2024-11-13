const { Client, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, CommandInteraction, ChannelType, PermissionFlagsBits } = require("discord.js");
const config = require("../../configuration/index");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "channel",
    description: "Various channel management commands",
    options: [
        {
            name: "delete",
            description: "Deletes a specified channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to delete",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: "info",
            description: "View information about a channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to get information about",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: "slowmode",
            description: "Set the rate limit for the current channel.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "duration",
                    description: "Enter a duration in seconds (between 0 and 21600).",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    minValue: 0,
                    maxValue: 21600
                }
            ]
        },
        {
            name: "clone",
            description: "Clones a specified channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to clone",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: "rename",
            description: "Renames a specified channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to rename",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: "new_name",
                    description: "The new name for the channel",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],

    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "delete") {
            // Delete Channel Subcommand
            const channel = interaction.options.getChannel("channel");

            // Check permissions
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ I don't have permission to manage channels.", ephemeral: true });
            }

            if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
            }

            try {
                // Delete the channel
                await channel.delete();

                // Reply to the user with an embed
                const replyEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(`✅ Channel deleted successfully: ${channel.name}`)
                    .setTimestamp();
                await interaction.reply({ embeds: [replyEmbed] });

                // Log the delete action (if log channel is set up)
                const logChannelId = await db.get(`log_bot_${interaction.guild.id}`);
                if (logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle("[CHANNEL DELETED]")
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "https://cdn.discordapp.com/attachments/798945891678421044/951585273324650496/discord-logo-white.png")
                            .addFields([
                                { name: 'Channel', value: channel.name },
                                { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})` },
                            ])
                            .setColor("#ff0000")
                            .setTimestamp()
                            .setFooter({ text: `${client.user.username} © 2024`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                        logChannel.send({ embeds: [logEmbed] });
                    }
                }

            } catch (error) {
                console.error("An error occurred while deleting the channel:", error);
                interaction.reply({ content: "❌ An error occurred while deleting the channel." });
            }

        } else if (subcommand === "info") {
            // Channel Info Subcommand
            const channel = interaction.options.getChannel('channel');

            if (!interaction.guild) {
                return interaction.reply({
                    content: 'This command can only be used in a server.',
                    ephemeral: true
                });
            }

            if (!interaction.member) {
                try {
                    await interaction.guild.members.fetch(interaction.user.id);
                } catch (error) {
                    console.error('Failed to fetch member:', error);
                    return interaction.reply({
                        content: 'Failed to fetch your member data. Please try again later.',
                        ephemeral: true
                    });
                }
            }

            if (!interaction.member.permissions.has(PermissionFlagsBits.ViewChannel)) {
                return interaction.reply({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Permission Denied',
                        description: 'You do not have permission to view channel information.',
                    }],
                    ephemeral: true
                });
            }

            try {
                const channelTypeText = ChannelType[channel.type];

                // Fetch @everyone overwrites and format permissions
                const everyoneOverwrites = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
                let permissionsList = "None";
                if (everyoneOverwrites) {
                    const allowedPermissions = everyoneOverwrites.allow.toArray().map(perm => perm.replace(/_/g, ' ').toLowerCase());
                    const deniedPermissions = everyoneOverwrites.deny.toArray().map(perm => `~~${perm.replace(/_/g, ' ').toLowerCase()}~~`);
                    permissionsList = [...allowedPermissions, ...deniedPermissions].join(', ');
                }

                const channelInfoEmbed = {
                    color: 0x00FF00,
                    title: `${channelTypeText} Channel Information`,
                    fields: [
                        { name: 'Name', value: channel.name, inline: true },
                        { name: 'ID', value: channel.id, inline: true },
                        { name: 'Created At', value: channel.createdAt.toUTCString(), inline: true },
                        { name: 'Topic', value: channel.topic || 'No topic set.' },
                        { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
                        { name: 'Position', value: channel.position.toString(), inline: true },
                        { name: 'Members', value: channel.members.size.toString(), inline: true },
                        { name: 'Parent Category', value: channel.parent ? channel.parent.name : 'No parent category.', inline: true },
                        { name: 'Main Permissions (@everyone)', value: permissionsList },
                    ],
                };

                await interaction.reply({ embeds: [channelInfoEmbed] });
            } catch (error) {
                console.error('An error occurred while processing the channelinfo command:', error);
                await interaction.reply({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Error',
                        description: 'An error occurred while fetching channel information.',
                    }],
                    ephemeral: true
                });
            }

        } else if (subcommand === "slowmode") {
            // Channel Slowmode Subcommand
            const duration = interaction.options.getInteger('duration');

            // Check if the bot has permission to manage channels
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: 'Error: Bot permission denied. Enable **Manage Channels** permission in `Server Settings > Roles` to use this command.', ephemeral: true });
            }

            // Check if the user has permission to manage channels
            if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            }

            try {
                if (duration === 0) {
                    await interaction.channel.setRateLimitPerUser(0);
                    const embed = new EmbedBuilder()
                        .setDescription('Successfully disabled slowmode for the current channel.')
                        .setColor(config.embedColor || `#00ff00`); // Use 'RANDOM' if config.embedColor is not defined
                    await interaction.reply({ embeds: [embed] });
                } else {
                    await interaction.channel.setRateLimitPerUser(duration);
                    const embed = new EmbedBuilder()
                        .setDescription(`Successfully set the current channel's rate limit to **${duration}** second(s).`)
                        .setColor(config.embedColor || `#00ff00`); // Use 'RANDOM' if config.embedColor is not defined
                    await interaction.reply({ embeds: [embed] });
                }
            } catch (error) {
                console.error(`Error in ${module.exports.name} command:`, error);
                interaction.reply({ content: "An error occurred while setting the slowmode. Please try again later.", ephemeral: true });
            }

        } else if (subcommand === "clone") {
            // Clone Channel Subcommand
            const channel = interaction.options.getChannel("channel");

            // Check permissions
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ I don't have permission to manage channels.", ephemeral: true });
            }

            if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
            }

            try {
                // Clone the channel, preserving its position
                const newChannel = await channel.clone({ position: channel.rawPosition });

                // Send a notification in the new channel
                const embed = new EmbedBuilder()
                    .setColor("#f7f7f7")
                    .setDescription(`Channel cloned by ${interaction.user.username}`)
                    .setTimestamp();
                await newChannel.send({ embeds: [embed] });

                // Reply to the user with an embed
                const replyEmbed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setDescription(`✅ Channel cloned successfully: ${newChannel}`)
                    .setTimestamp();
                await interaction.reply({ embeds: [replyEmbed] });

                // Log the clone action (if log channel is set up)
                const logChannelId = await db.get(`log_bot_${interaction.guild.id}`);
                if (logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle("[CHANNEL CLONED]")
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "https://cdn.discordapp.com/attachments/798945891678421044/951585273324650496/discord-logo-white.png")
                            .addFields([
                                { name: 'Original Channel', value: channel.toString() },
                                { name: 'New Channel', value: newChannel.toString() },
                                { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})` },
                            ])
                            .setColor("#00ff00")
                            .setTimestamp()
                            .setFooter({ text: `${client.user.username} © 2024`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                        logChannel.send({ embeds: [logEmbed] });
                    }
                }

            } catch (error) {
                console.error("An error occurred while cloning the channel:", error);
                interaction.reply({ content: "❌ An error occurred while cloning the channel." });
            }

        } else if (subcommand === "rename") {
            // Rename Channel Subcommand
            const channel = interaction.options.getChannel("channel");
            const newName = interaction.options.getString("new_name");

            // Check permissions
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ I don't have permission to manage channels.", ephemeral: true });
            }

            if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply({ content: "❌ You don't have permission to use this command.", ephemeral: true });
            }

            try {
                // Rename the channel
                await channel.setName(newName);

                // Reply to the user with an embed
                const replyEmbed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setDescription(`✅ Channel renamed successfully: ${channel}`)
                    .setTimestamp();
                await interaction.reply({ embeds: [replyEmbed] });

                // Log the rename action (if log channel is set up)
                const logChannelId = await db.get(`log_bot_${interaction.guild.id}`);
                if (logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle("[CHANNEL RENAMED]")
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "https://cdn.discordapp.com/attachments/798945891678421044/951585273324650496/discord-logo-white.png")
                            .addFields([
                                { name: 'Channel', value: channel.toString() },
                                { name: 'New Name', value: newName },
                                { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})` },
                            ])
                            .setColor("#00ff00")
                            .setTimestamp()
                            .setFooter({ text: `${client.user.username} © 2024`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                        logChannel.send({ embeds: [logEmbed] });
                    }
                }

            } catch (error) {
                console.error("An error occurred while renaming the channel:", error);
                interaction.reply({ content: "❌ An error occurred while renaming the channel." });
            }
        }
    }
};
