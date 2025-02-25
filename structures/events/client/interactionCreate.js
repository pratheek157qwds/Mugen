const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const client = require("../../client");
const { developers } = require("../../configuration/index");
const { logger } = require("../../functions/logger");

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

    try {
        if (interaction.isCommand()) {
            const command = client.slashCommands.get(interaction.commandName)

            const player = client.riffy.players.get(interaction.guildId);
            const memberChannel = interaction.member.voice.channelId;
            const clientChannel = interaction.guild.members.me.voice.channelId;

            if (!command) {
                return interaction.reply({
                    content: `${interaction.commandName} is not a valid command`,
                    ephemeral: true,
                });
            }

            if (command.developerOnly) {
                if (!developers.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: `${interaction.commandName} is a developer only command`,
                        ephemeral: true,
                    });
                }
            }

            if (command.userPermissions) {
                if (!interaction.channel.permissionsFor(interaction.member).has(PermissionsBitField.resolve(command.userPermissions || []))) {
                    return interaction.reply({
                        content: `You do not have the required permissions to use this command. You need the following permissions: ${command.userPermissions.join(", ")}`,
                        ephemeral: true,
                    });
                }
            }

            if (command.clientPermissions) {
                if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.resolve(command.clientPermissions || []))) {
                    return interaction.reply({
                        content: `I do not have the required permissions to use this command. I need the following permissions: ${command.clientPermissions.join(", ")}`,
                        ephemeral: true,
                    });
                }
            }

            if (command.guildOnly && !interaction.guildId) {
                return interaction.reply({
                    content: `${interaction.commandName} is a guild only command`,
                    ephemeral: true,
                });
            }

            if (command.inVoice && !memberChannel) {
                return interaction.reply({
                    content: `You must be in a voice channel to use this command.`,
                    ephemeral: true,
                });
            }

            if (command.sameVoice && memberChannel !== clientChannel) {
                return interaction.reply({
                    content: `You must be in the same voice channel as me to use this command.`,
                    ephemeral: true,
                });
            }

            if (command.player && !player) {
                return interaction.reply({
                    content: `No music is currently playing.`,
                    ephemeral: true,
                });
            }

            if (command.current && !player.current) {
                return interaction.reply({
                    content: `I am not playing anything right now.`,
                    ephemeral: true,
                });
            }
 
            await command.run(client, interaction, interaction.options);
        }

        if (interaction.isButton() && interaction.customId.startsWith('reply_')) {
            const [_, originalInteractionId, userId] = interaction.customId.split('_');

            const modal = new ModalBuilder()
                .setCustomId(`replyModal_${originalInteractionId}_${userId}`)
                .setTitle('Reply to Report');

            const replyInput = new TextInputBuilder()
                .setCustomId('replyText')
                .setLabel('Your reply:')
                .setStyle(TextInputStyle.Paragraph);

            modal.addComponents(new ActionRowBuilder().addComponents(replyInput));

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('replyModal_')) {
            const [_, originalInteractionId, userId] = interaction.customId.split('_');
            const replyText = interaction.fields.getTextInputValue('replyText');

            try {
                const userToReply = await client.users.fetch(userId);
                await userToReply.send(`Developer reply to your report:\n${replyText}`);
                await interaction.reply({ content: 'Reply sent successfully!', ephemeral: true });
            } catch (err) {
                console.error(`Could not send DM to user with ID ${userId}.`, err);
                await interaction.reply({ content: 'There was an error sending your reply.', ephemeral: true });
            }
        }
    } catch (err) {
        logger("An error occurred while processing a slash command:", "error")
        console.log(err);

        return interaction.reply({
            content: `An error has occurred while processing a slash command: ${err}`,
            ephemeral: true,
        });
    }
});
