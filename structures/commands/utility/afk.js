const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../../configuration/index');

module.exports = {
    name: 'afk',
    description: 'Manage AFK statuses',
    aliases: ['setafk', 'afklist', 'removeafk'],

    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args
     * @returns 
     */
    run: async (client, message, args) => {
        const subcommand = args[0];

        if (subcommand === 'set') {
            const reason = args.slice(1).join(' ');
            if (!reason) {
                return message.reply('Please provide a reason for being AFK.');
            }
            await db.set(`afk_${message.author.id}`, reason);
            await message.reply(`Your AFK status has been set: ${reason}`);

        } else if (subcommand === 'list') {
            const allAfk = await db.all();
            const afkUsers = allAfk.filter(entry => entry.id.startsWith('afk_'));

            if (afkUsers.length === 0) {
                return message.reply('No users are currently AFK.');
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

            const messageComponent = await message.reply({ embeds: [embed], components: [row] });

            const filter = i => i.user.id === message.author.id;
            const collector = messageComponent.createMessageComponentCollector({ filter, time: 60000 });

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
                messageComponent.edit({ content: 'Paginator expired', components: [] });
            });

        } else if (subcommand === 'remove') {
            await db.delete(`afk_${message.author.id}`);
            await message.reply('Your AFK status has been removed.');
        } else {
            message.reply('Invalid subcommand. Use `set`, `list`, or `remove`.');
        }
    },
};
