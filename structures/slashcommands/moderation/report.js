const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../configuration/index.js'); 

module.exports = {
  name: 'report',
  description: 'Send a report to the developers',
  options: [
    {
      name: 'query',
      description: 'The query to report',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const query = interaction.options.getString('query');
    const user = interaction.user;

    // Embed for the channel
    const channelEmbed = new EmbedBuilder()
      .setTitle('Report Submitted')
      .setDescription(`Your report has been submitted. Thank you for reporting!`)
      .setColor('#FFD700')
      .setTimestamp()
      .setFooter({
        text: `Report by ${user.username}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [channelEmbed], ephemeral: true });

    // Notify the user in DM
    try {
      await user.send('Your report has been sent to the developers. Thank you for reporting!');
    } catch (err) {
      console.error(`Could not send DM to ${user.tag}.`);
    }

    // Notify the developers in DM
    for (const developerId of config.developers) {
      try {
        const developer = await client.users.fetch(developerId);
        const developerEmbed = new EmbedBuilder()
          .setTitle('New Report Received')
          .setDescription(`**Report from ${user.tag}:**\n${query}`)
          .setColor('#FF0000')
          .setTimestamp()
          .setFooter({
            text: `Reported by ${user.username}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
          });

        const replyButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`reply_${interaction.id}_${user.id}`)
              .setLabel('Reply to Report')
              .setStyle(ButtonStyle.Primary)
          );

        await developer.send({ embeds: [developerEmbed], components: [replyButton] });
      } catch (err) {
        console.error(`Could not send DM to developer with ID ${developerId}.`, err);
      }
    }
  }
};
