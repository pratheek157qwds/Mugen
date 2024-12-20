const { Client, CommandInteraction, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'listadmins',
  description: 'Lists all members with administrative permissions in the guild with pagination',
  type: ApplicationCommandType.ChatInput,

  async run(client, interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true
      });
    }

    let admins = [];
    try {
      const members = await interaction.guild.members.fetch();
      admins = members.filter(member => member.permissions.has(PermissionsBitField.Flags.Administrator)).map(member => ({
        tag: member.user.tag,
        id: member.user.id,
        createdAt: member.user.createdAt.toUTCString(),
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return interaction.reply({
        content: 'Failed to fetch members. Please try again later.',
        ephemeral: true
      });
    }

    if (admins.length === 0) {
      return interaction.reply({
        content: 'No members with administrative permissions found in this server.',
        ephemeral: true
      });
    }

    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageAdmins = admins.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Administrators')
        .setDescription('List of members with administrative permissions')
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

      pageAdmins.forEach(admin => {
        embed.addFields([
          { name: 'Name', value: admin.tag, inline: true },
          { name: 'ID', value: admin.id, inline: true },
          { name: 'Account Created', value: admin.createdAt, inline: true },
        ]);
      });

      return embed;
    };

    const getButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('First')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('delete')
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('Last')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1),
      );
    };

    const message = await interaction.reply({ embeds: [generateEmbed(currentPage)], components: [getButtons(currentPage)], fetchReply: true });

    const filter = i => ['first', 'previous', 'delete', 'next', 'last'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      switch (i.customId) {
        case 'first':
          currentPage = 0;
          break;
        case 'previous':
          if (currentPage > 0) currentPage--;
          break;
        case 'delete':
          collector.stop('deleted');
          await i.update({ content: 'Embed deleted.', embeds: [], components: [] });
          return;
        case 'next':
          if (currentPage < totalPages - 1) currentPage++;
          break;
        case 'last':
          currentPage = totalPages - 1;
          break;
      }
      await i.update({ embeds: [generateEmbed(currentPage)], components: [getButtons(currentPage)] });
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'deleted') {
        interaction.editReply({ content: 'Paginator expired.', components: [] });
      }
    });
  },
};
