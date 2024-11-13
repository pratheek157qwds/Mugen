const { Client, CommandInteraction, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vc',
    description: 'Voice channel related commands',
    options: [
        {
            name: 'list',
            description: 'Lists members in your current voice channel.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Specify a voice channel to list members from (optional).',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'disconnect',
            description: 'Disconnect a member from their current voice channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'The member to disconnect',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ]
        },
        {
            name: 'move',
            description: 'Move a member to a selected voice channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'The member to move',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'channel',
                    description: 'The voice channel to move the member to',
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: ['GUILD_VOICE'],
                    required: true,
                }
            ]
        }
    ],

    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            // vclist subcommand logic
            const clientColor = client.color || '#FFFFFF'; // Set a default color if client.color is undefined

            let targetChannel = interaction.member.voice.channel;
            const channelOption = interaction.options.getChannel('channel');
            if (channelOption && channelOption.type === 'GUILD_VOICE') {
                targetChannel = channelOption;
            }

            if (!targetChannel) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(clientColor)
                            .setTitle(`Error`)
                            .setDescription(`You must be connected to a voice channel or specify a valid voice channel.`)
                    ]
                });
            }

            let members = interaction.guild.members.cache
                .filter(m => m.voice?.channel?.id === targetChannel.id)
                .map(m => `${m.user.tag} | <@${m.user.id}>`)
                .join(`\n`);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(clientColor)
                        .setTitle(`Users in ${targetChannel.name} - ${targetChannel.members.size}`)
                        .setDescription(members)
                ]
            });
        } else if (subcommand === 'disconnect') {
            // voicedisconnect subcommand logic
            const member = interaction.options.getMember('member');

            const abusiveReplies = [
                "Who do you think you are, trying to use this command?",
                "Nice try, but you don't have the power here.",
                "Stick to your lane, buddy. You're not allowed to use this command.",
                "Don't even think about it. You can't use this command.",
                "Know your place! This command isn't for you.",
                "Back off! You don't have the permissions to use this.",
                "Stay in your lane! You can't use this command."
            ];

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                const abusiveReply = abusiveReplies[Math.floor(Math.random() * abusiveReplies.length)];
                return interaction.reply({ content: abusiveReply, ephemeral: true });
            }

            await interaction.deferReply();

            try {
                const botMember = await interaction.guild.members.fetch(client.user.id);

                if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                    return interaction.followUp({
                        embeds: [{
                            color: 0xFF0000,
                            title: 'Error',
                            description: `I don't have permission to disconnect members.`,
                        }]
                    });
                }

                if (!member.voice.channel) {
                    return interaction.followUp({
                        embeds: [{
                            color: 0xFF0000,
                            title: 'Error',
                            description: `${member.user.tag} is not in a voice channel.`,
                        }]
                    });
                }

                await member.voice.setChannel(null);
                await interaction.followUp({
                    embeds: [{
                        color: 0x00FF00,
                        title: 'Member Disconnected',
                        description: `${member.user.tag} has been disconnected from their voice channel.`,
                    }]
                });

            } catch (error) {
                console.error('An error occurred while processing the voicedisconnect command:', error);
                await interaction.followUp({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Error',
                        description: `An error occurred while processing your request.`,
                    }]
                });
            }
        } else if (subcommand === 'move') {
            // voicemove subcommand logic
            const member = interaction.options.getMember('member');
            const channel = interaction.options.getChannel('channel');

            const abusiveReplies = [
                "Who do you think you are, trying to use this command?",
                "Nice try, but you don't have the power here.",
                "Stick to your lane, buddy. You're not allowed to use this command.",
                "Don't even think about it. You can't use this command.",
                "Know your place! This command isn't for you.",
                "Back off! You don't have the permissions to use this.",
                "Stay in your lane! You can't use this command."
            ];

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                const abusiveReply = abusiveReplies[Math.floor(Math.random() * abusiveReplies.length)];
                return interaction.reply({ content: abusiveReply, ephemeral: true });
            }

            await interaction.deferReply();

            try {
                const botMember = await interaction.guild.members.fetch(client.user.id);

                if (!botMember.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                    return interaction.followUp({
                        embeds: [{
                            color: 0xFF0000,
                            title: 'Error',
                            description: `I don't have permission to move members.`,
                        }]
                    });
                }

                if (!member.voice.channel) {
                    return interaction.followUp({
                        embeds: [{
                            color: 0xFF0000,
                            title: 'Error',
                            description: `${member.user.tag} is not in a voice channel.`,
                        }]
                    });
                }

                await member.voice.setChannel(channel);
                await interaction.followUp({
                    embeds: [{
                        color: 0x00FF00,
                        title: 'Member Moved',
                        description: `${member.user.tag} has been moved to ${channel.name}.`,
                    }]
                });

            } catch (error) {
                console.error('An error occurred while processing the voicemove command:', error);
                await interaction.followUp({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Error',
                        description: `An error occurred while processing your request.`,
                    }]
                });
            }
        }
    }
};
