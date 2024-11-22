const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'banword',
  description: 'Manage banned words',
  options: [
    {
      name: 'add',
      description: 'Add a new banned word',
      type: 1,
      options: [
        {
          name: 'word',
          description: 'The word to ban',
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: 'list',
      description: 'List all banned words',
      type: 1,
    },
    {
      name: 'clear',
      description: 'Clear all banned words',
      type: 1,
    },
    {
      name: 'remove',
      description: 'Remove a banned word',
      type: 1,
      options: [
        {
          name: 'word',
          description: 'The banned word to remove',
          type: 3,
          required: true,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'add') {
      const word = interaction.options.getString('word');
      const bannedWords = (await db.get(`banned_words_${guildId}`)) || [];

      if (bannedWords.includes(word.toLowerCase())) {
        return interaction.reply({ content: `The word "${word}" is already banned.`, ephemeral: true });
      }

      bannedWords.push(word.toLowerCase());
      await db.set(`banned_words_${guildId}`, bannedWords);

      return interaction.reply({ content: `The word "${word}" has been added to the ban list.`, ephemeral: true });

    } else if (subcommand === 'list') {
      const bannedWords = (await db.get(`banned_words_${guildId}`)) || [];

      if (bannedWords.length === 0) {
        return interaction.reply({ content: 'There are no banned words.', ephemeral: true });
      }

      const pages = [];
      for (let i = 0; i < bannedWords.length; i += 10) {
        const page = bannedWords.slice(i, i + 10).map((word, index) => `${index + 1}. **${word}**`).join('\n');
        pages.push(page);
      }

      let currentPage = 0;

      const embed = new EmbedBuilder()
        .setTitle('Banned Words')
        .setDescription(pages[currentPage])
        .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
        .setColor('#ff0000');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger)
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
          .setTitle('Banned Words')
          .setDescription(pages[currentPage])
          .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
          .setColor('#ff0000');

        await i.update({ embeds: [newEmbed] });
      });

      collector.on('end', collected => {
        message.edit({ content: 'Paginator expired', components: [] });
      });

    } else if (subcommand === 'clear') {
      await db.delete(`banned_words_${guildId}`);
      return interaction.reply({ content: 'All banned words have been cleared.', ephemeral: true });

    } else if (subcommand === 'remove') {
      const word = interaction.options.getString('word');
      const bannedWords = (await db.get(`banned_words_${guildId}`)) || [];

      if (!bannedWords.includes(word.toLowerCase())) {
        return interaction.reply({ content: `The word "${word}" is not in the ban list.`, ephemeral: true });
      }

      const updatedWords = bannedWords.filter(w => w !== word.toLowerCase());
      await db.set(`banned_words_${guildId}`, updatedWords);

      return interaction.reply({ content: `The word "${word}" has been removed from the ban list.`, ephemeral: true });
    }
  },
};
