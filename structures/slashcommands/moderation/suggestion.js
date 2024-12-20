const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  name: 'suggestion',
  description: 'Make a suggestion for the bot',

  async execute(interaction) {
    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("suggestButton")
          .setLabel("Make a Suggestion")
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription("Click the button below to submit a suggestion.")],
      components: [button],
      ephemeral: true
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 120000 });

    collector.on('collect', async i => {
      if (i.customId === 'suggestButton') {
        const modal = new ModalBuilder()
          .setCustomId('requestModal')
          .setTitle('New Suggestion');

        const suggestionTypeInput = new TextInputBuilder()
          .setCustomId('suggestionType')
          .setLabel('Type of Suggestion')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('E.g., Bug Report, Feature Request, etc.')
          .setRequired(true);

        const suggestionDetailsInput = new TextInputBuilder()
          .setCustomId('suggestionDetails')
          .setLabel('Suggestion Details')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(suggestionTypeInput),
          new ActionRowBuilder().addComponents(suggestionDetailsInput)
        );

        await i.showModal(modal);
      }
    });

    collector.on('end', async (collected) => {
      const modalInteraction = collected.first();

      if (modalInteraction) {
        try {
          const suggestionType = modalInteraction.fields.getTextInputValue('suggestionType');
          const suggestionDetails = modalInteraction.fields.getTextInputValue('suggestionDetails');

          const botOwnerId = '744557711513092098';
          const botOwner = await client.users.fetch(botOwnerId);

          if (botOwner) {
            await botOwner.send(`**New Suggestion from ${interaction.user.tag}:**\n\n**Type:** ${suggestionType}\n**Details:** ${suggestionDetails}`);

            if (!modalInteraction.deferred) {
              await modalInteraction.deferReply({ ephemeral: true });
              await modalInteraction.editReply({ content: 'Your suggestion has been sent to the bot owner!', ephemeral: true });
            } else {
              await modalInteraction.followUp({ content: 'Your suggestion has been sent to the bot owner!', ephemeral: true });
            }
          } else {
            console.error('Bot owner not found.');
            await modalInteraction.reply({ content: 'An error occurred while sending your suggestion.', ephemeral: true });
          }
        } catch (error) {
          console.error('Error sending suggestion:', error);
          await modalInteraction.followUp({ content: 'An error occurred while sending your suggestion.', ephemeral: true });
        }
      } else {
        try {
          await interaction.editReply({
            content: 'Your suggestion timed out. Please use the `/suggestion` command again to resubmit.',
            components: [],
            embeds: []
          });
        } catch (error) {
          await interaction.followUp({ content: 'Your suggestion timed out. Please use the `/suggestion` command again to resubmit.', ephemeral: true });
        }
      }
    });
  },
};
