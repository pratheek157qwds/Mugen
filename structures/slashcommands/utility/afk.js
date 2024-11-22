const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../../configuration/index');

module.exports = {
  name: 'afk',
  description: 'Manage AFK statuses',
  options: [
    {
      name: 'set',
      description: 'Set your AFK status',
      type: 1,
      options: [
        {
          name: 'reason',
          description: 'The reason for being AFK',
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: 'list',
      description: 'List all AFK users',
      type: 1,
    },
    {
      name: 'remove',
      description: 'Remove your AFK status',
      type: 1,
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const reason = interaction.options.getString('reason');
      await db.set(`afk_${interaction.user.id}`, reason);
      await interaction.reply({ content: `Your AFK status has been set: ${reason}`, ephemeral: true });

    } else if (subcommand === 'list') {
      const allAfk = await db.all();
      const afkUsers = allAfk.filter(entry => entry.id.startsWith('afk_'));

      if (afkUsers.length === 0) {
        return interaction.reply({ content: 'No users are currently AFK.', ephemeral: true });
      }

      const pages = [];
      for (let i = 0; i < afkUsers.length; i += 10) {
        const page = afkUsers.slice(i, i + 10).map(entry => {
          const userId = entry.id.replace('afk_', '');
          const user = client.users.cache.get(userId);
          return `**${user ? user.tag : 'Unknown User'}:** ${entry.value}`;
        }).join('\n');

        pages.push(page);
      }

      let currentPage = 0;

      const embed = new EmbedBuilder()
        .setTitle('AFK Users')
        .setDescription(pages[currentPage])
        .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
        .setColor('#0099ff');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('First')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Prev')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('Last')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('delete')
            .setLabel('Delete')
            .setStyle(ButtonStyle.Danger)
        );

      const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const filter = i => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'first') {
          currentPage = 0;
        } else if (i.customId === 'prev') {
          if (currentPage > 0) currentPage--;
        } else if (i.customId === 'next') {
          if (currentPage < pages.length - 1) currentPage++;
        } else if (i.customId === 'last') {
          currentPage = pages.length - 1;
        } else if (i.customId === 'delete') {
          await i.update({ content: 'Paginator expired', embeds: [], components: [] });
          return;
        }

        const newEmbed = new EmbedBuilder()
          .setTitle('AFK Users')
          .setDescription(pages[currentPage])
          .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
          .setColor('#0099ff');

        await i.update({ embeds: [newEmbed] });
      });

      collector.on('end', collected => {
        message.edit({ content: 'Paginator expired', components: [] });
      });

    } else if (subcommand === 'remove') {
      await db.delete(`afk_${interaction.user.id}`);
      await interaction.reply({ content: 'Your AFK status has been removed.', ephemeral: true });
    }
  },
};
