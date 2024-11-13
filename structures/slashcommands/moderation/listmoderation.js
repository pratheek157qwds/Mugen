const { Client, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'list',
  description: 'Lists various server information with pagination',
  options: [
    {
      name: 'bots',
      description: 'Lists all bots in the server with pagination',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'boosters',
      description: 'Lists all boosters in the server with pagination',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'createpos',
      description: 'Lists all members in the server by account creation date with pagination',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'emojis',
      description: 'Lists all emojis in the server with pagination',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'roles',
      description: 'Lists all roles in the server with pagination',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    await interaction.guild.members.fetch(); // Ensure all members are cached

    const subcommand = interaction.options.getSubcommand();

    const generateComponents = (page, totalItems, itemsPerPage, disabled = false) => new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('first').setLabel('⏮️').setStyle(ButtonStyle.Primary).setDisabled(page === 0 || disabled),
        new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Primary).setDisabled(page === 0 || disabled),
        new ButtonBuilder().setCustomId('delete').setLabel('🗑️').setStyle(ButtonStyle.Danger).setDisabled(disabled),
        new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Primary).setDisabled((page + 1) * itemsPerPage >= totalItems || disabled),
        new ButtonBuilder().setCustomId('last').setLabel('⏭️').setStyle(ButtonStyle.Primary).setDisabled((page + 1) * itemsPerPage >= totalItems || disabled)
      );

    const paginatorHandler = async (items, generateEmbed, totalItems) => {
      const itemsPerPage = 10;
      let currentPage = 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const embedMessage = await interaction.reply({
        embeds: [generateEmbed(currentPage, totalPages)],
        components: [generateComponents(currentPage, totalItems, itemsPerPage)],
        fetchReply: true,
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });

      collector.on('collect', async (i) => {
        if (i.customId === 'first') {
          currentPage = 0;
        } else if (i.customId === 'prev') {
          currentPage = Math.max(currentPage - 1, 0);
        } else if (i.customId === 'next') {
          currentPage = Math.min(currentPage + 1, totalPages - 1);
        } else if (i.customId === 'last') {
          currentPage = totalPages - 1;
        } else if (i.customId === 'delete') {
          collector.stop('user ended session');
          return interaction.deleteReply();
        }

        await i.update({
          embeds: [generateEmbed(currentPage, totalPages)],
          components: [generateComponents(currentPage, totalItems, itemsPerPage)]
        });
      });

      collector.on('end', collected => {
        embedMessage.edit({
          content: 'Paginator Expired',
          embeds: [generateEmbed(currentPage, totalPages)],
          components: [generateComponents(currentPage, totalItems, itemsPerPage, true)]
        });
      });
    };

    if (subcommand === 'bots') {
      const bots = interaction.guild.members.cache
        .filter(member => member.user.bot)
        .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
        .map(member => ({
          tag: member.user.tag,
          id: member.user.id,
          joinedAt: member.joinedAt.toLocaleDateString(),
          profileLink: `[${member.user.tag}](https://discord.com/users/${member.user.id})`
        }));

      const totalBots = bots.length;

      const generateEmbed = (page, totalPages) => {
        const start = page * 10;
        const end = start + 10;
        const botsList = bots.slice(start, end).map((bot, index) => {
          return `${start + index + 1}. ${bot.profileLink} - Joined at ${bot.joinedAt}`;
        }).join('\n');

        return new EmbedBuilder()
          .setTitle(`List of Bots in ${interaction.guild.name} - ${totalBots}`)
          .setDescription(botsList || 'No bots found')
          .setFooter({
            text: `Requested by ${interaction.user.username} | Page ${page + 1}/${totalPages}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setColor('#000000')
          .setTimestamp();
      };

      await paginatorHandler(bots, generateEmbed, totalBots);
    }

    if (subcommand === 'boosters') {
      const boosters = interaction.guild.members.cache.filter(member => member.premiumSince !== null)
        .map(member => ({
          tag: member.user.tag,
          id: member.user.id,
          premiumSince: member.premiumSince.toLocaleDateString(),
          profileLink: `[${member.user.tag}](https://discord.com/users/${member.user.id})`
        }));

      const totalBoosters = boosters.length;

      const generateEmbed = (page, totalPages) => {
        const start = page * 10;
        const end = start + 10;
        const boostersList = boosters.slice(start, end).map((booster, index) => {
          return `${start + index + 1}. ${booster.profileLink} - Boosting since ${booster.premiumSince}`;
        }).join('\n');

        return new EmbedBuilder()
          .setTitle(`List of Boosters in ${interaction.guild.name} - ${totalBoosters}`)
          .setDescription(boostersList || 'No boosters found')
          .setFooter({
            text: `Requested by ${interaction.user.username} | Page ${page + 1}/${totalPages}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setColor('#000000')
          .setTimestamp();
      };

      await paginatorHandler(boosters, generateEmbed, totalBoosters);
    }

    if (subcommand === 'createpos') {
      const members = interaction.guild.members.cache
        .sort((a, b) => a.user.createdTimestamp - b.user.createdTimestamp)
        .map(member => ({
          tag: member.user.tag,
          id: member.user.id,
          createdAt: member.user.createdAt.toLocaleDateString(),
          profileLink: `[${member.user.tag}](https://discord.com/users/${member.user.id})`
        }));

      const totalMembers = members.length;

      const generateEmbed = (page, totalPages) => {
        const start = page * 10;
        const end = start + 10;
        const membersList = members.slice(start, end).map((member, index) => {
          return `${start + index + 1}. ${member.profileLink} - ${member.createdAt}`;
        }).join('\n');

        return new EmbedBuilder()
          .setTitle(`Creation Dates of Members in ${interaction.guild.name} - ${totalMembers}`)
          .setDescription(membersList || 'No members found')
          .setFooter({
            text: `Requested by ${interaction.user.username} | Page ${page + 1}/${totalPages}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setColor('#000000')
          .setTimestamp();
      };

      await paginatorHandler(members, generateEmbed, totalMembers);
    }

    if (subcommand === 'emojis') {
      await interaction.guild.emojis.fetch(); // Ensure all emojis are cached

      const emojis = interaction.guild.emojis.cache.map(emoji => ({
        name: emoji.name,
        id: emoji.id,
        url: emoji.url,
        emoji: emoji.toString(), // Get the emoji as a string
      }));

      const totalEmojis = emojis.length;

      const generateEmbed = (page, totalPages) => {
        const start = page * 10;
        const end = start + 10;
        const emojisList = emojis.slice(start, end).map((emoji, index) => {
          return `${emoji.emoji} **${emoji.name}** - ID: ${emoji.id} ${emoji.url ? `[Link](${emoji.url})` : ''}`;
        }).join('\n\n');

        return new EmbedBuilder()
          .setTitle(`List of Emojis in ${interaction.guild.name} - ${totalEmojis}`)
          .setDescription(emojisList || 'No emojis found')
          .setFooter({
            text: `Requested by ${interaction.user.username} | Page ${page + 1}/${totalPages}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setColor('#000000')
          .setTimestamp();
      };

      await paginatorHandler(emojis, generateEmbed, totalEmojis);
    }

    if (subcommand === 'roles') {
      const roles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role);
      const totalRoles = roles.length;

      const highestPermissions = [
        { flag: PermissionsBitField.Flags.Administrator, label: 'Administrator' },
        { flag: PermissionsBitField.Flags.ManageGuild, label: 'Manage Server' },
        { flag: PermissionsBitField.Flags.ManageRoles, label: 'Manage Roles' },
        { flag: PermissionsBitField.Flags.ManageChannels, label: 'Manage Channels' },
        { flag: PermissionsBitField.Flags.KickMembers, label: 'Kick Members' },
        { flag: PermissionsBitField.Flags.BanMembers, label: 'Ban Members' },
        { flag: PermissionsBitField.Flags.ManageMessages, label: 'Manage Messages' },
        { flag: PermissionsBitField.Flags.ViewAuditLog, label: 'View Audit Log' },
        { flag: PermissionsBitField.Flags.ManageWebhooks, label: 'Manage Webhooks' },
        { flag: PermissionsBitField.Flags.ManageEmojisAndStickers, label: 'Manage Emojis and Stickers' },
        // Add other permissions as needed
      ];

      const getHighestPermission = (permissions) => {
        for (const perm of highestPermissions) {
          if (permissions.has(perm.flag)) {
            return perm.label;
          }
        }
        return 'None';
      };

      const generateEmbed = (page, totalPages) => {
        const start = page * 10;
        const end = start + 10;
        const rolesList = roles.slice(start, end).map((role, index) => {
          const highestPermission = getHighestPermission(role.permissions);
          return `${start + index + 1}. <@&${role.id}> - [${role.id}] - ${highestPermission}`;
        }).join('\n');

        return new EmbedBuilder()
          .setTitle(`List of Roles in ${interaction.guild.name} - ${totalRoles}`)
          .setDescription(rolesList || 'No roles found')
          .setFooter({
            text: `Requested by ${interaction.user.username} | Page ${page + 1}/${totalPages}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          })
          .setColor('#000000')
          .setTimestamp();
      };

      await paginatorHandler(roles, generateEmbed, totalRoles);
    }
  }
};
