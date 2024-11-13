const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'whitelist',
  description: 'Whitelist a gamertag',
  options: [
    {
      name: 'gamertag',
      description: 'The gamertag to whitelist',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'platform',
      description: 'The platform of the gamertag',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'PE', value: 'pe' },
        { name: 'Java', value: 'java' },
        { name: 'Bedrock', value: 'bedrock' },
      ],
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const gamertag = interaction.options.getString('gamertag');
    const platform = interaction.options.getString('platform');

    const channelId = await db.get(`whitelist_channel_${interaction.guild.id}`);
    
    if (!channelId) {
      return interaction.reply('Whitelist channel is not configured. Please contact an admin.');
    }

    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
      return interaction.reply('Whitelist channel not found. Please contact an admin.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Whitelist Request')
      .addFields(
        { name: 'Gamertag', value: gamertag, inline: true },
        { name: 'Platform', value: platform, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setColor('#00FF00');

    await channel.send({ embeds: [embed] });
    await interaction.reply('Please wait for 10-15 minutes to get whitelisted.');
  },
};
