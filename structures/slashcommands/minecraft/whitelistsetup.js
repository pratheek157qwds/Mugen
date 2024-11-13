const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'setwhitelistchannel',
  description: 'Set the channel for whitelist requests',
  options: [
    {
      name: 'channel',
      description: 'The channel to send whitelist requests to',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply('You do not have permission to use this command.');
    }

    const channel = interaction.options.getChannel('channel');
    await db.set(`whitelist_channel_${interaction.guild.id}`, channel.id);
    
    await interaction.reply(`Whitelist channel has been set to ${channel}`);
  },
};
