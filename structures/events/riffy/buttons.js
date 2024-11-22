const client = require("../../client");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const player = client.riffy.players.get(interaction.guild.id);

    if (!player) return interaction.followUp({ content: `The player doesn't exist`, ephemeral: true });

    if (interaction.customId === 'pause') {
        await interaction.deferUpdate();
        player.pause(true);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:stop:1191764297542545569>'),

                new ButtonBuilder()
                    .setCustomId('play')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('▶'),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:skip:1224272565237715014>'),

                new ButtonBuilder()
                    .setCustomId('volume_down')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:volumedown:1224269238190080040>'),

                new ButtonBuilder()
                    .setCustomId('volume_up')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:volumeup:1224268333856063539>')
            );

        return await interaction.message.edit({
            components: [row]
        });
    } else if (interaction.customId === 'play') {
        await interaction.deferUpdate();
        player.pause(false);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:stop:1191764297542545569>'),

                new ButtonBuilder()
                    .setCustomId('pause')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:pause:1191764245864525954>'),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:skip:1224272565237715014>'),

                new ButtonBuilder()
                    .setCustomId('volume_down')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:volumedown:1224269238190080040>'),

                new ButtonBuilder()
                    .setCustomId('volume_up')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:volumeup:1224268333856063539>')
            );

        return await interaction.message.edit({
            components: [row]
        });

    } else if (interaction.customId === 'volume_up') {
        await interaction.deferUpdate();

        let volume = player.volume;
        volume = Math.min(100, volume + 20);
        player.setVolume(volume);

        return interaction.followUp({ content: `Volume increased to ${volume}%`, ephemeral: true });

    } else if (interaction.customId === 'volume_down') {
        await interaction.deferUpdate();

        let volume = player.volume;
        volume = Math.max(0, volume - 20);
        player.setVolume(volume);

        return interaction.followUp({ content: `Volume decreased to ${volume}%`, ephemeral: true });

    } else if (interaction.customId === 'skip') {
        await interaction.deferUpdate();
        player.stop();

        const rowDisabled = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:stop:1191764297542545569>')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('pause')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:pause:1191764245864525954>')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:skip:1224272565237715014>')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skiped')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Skipped')
                    .setDisabled(true)
            );

        return await interaction.message.edit({
            components: [rowDisabled]
        });
    } else if (interaction.customId === 'disconnect') {
        await interaction.deferUpdate();
        player.destroy();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:stop:1191764297542545569>')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('play')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('▶')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:skip:1224272565237715014>')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skiped')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Disconnected')
                    .setDisabled(true)
            );

        return await interaction.message.edit({
            components: [row]
        });
    }
});
