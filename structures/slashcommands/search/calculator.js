const { Client, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "calculator",
  description: "Opens an interactive calculator",

  run: async (client, interaction) => {
    const initialEmbed = new EmbedBuilder()
      .setTitle('Calculator')
      .setDescription('Result: `-`')
      .setFooter({
        text: `Requested By ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setColor('#000000');

    const initialMessage = await interaction.reply({
      embeds: [initialEmbed],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('AC').setLabel('AC').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('(').setLabel('(').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(')').setLabel(')').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('/').setLabel('/').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('DEL').setLabel('DEL').setStyle(ButtonStyle.Danger),
          ),
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('7').setLabel('7').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('8').setLabel('8').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('9').setLabel('9').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('*').setLabel('*').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('%').setLabel('%').setStyle(ButtonStyle.Primary),
          ),
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('4').setLabel('4').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('5').setLabel('5').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('6').setLabel('6').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('-').setLabel('-').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('^').setLabel('^').setStyle(ButtonStyle.Primary),
          ),
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('1').setLabel('1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('2').setLabel('2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('3').setLabel('3').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('+').setLabel('+').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('√').setLabel('√').setStyle(ButtonStyle.Primary),
          ),
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('0').setLabel('0').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('00').setLabel('00').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('.').setLabel('.').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('=').setLabel('=').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('OFF').setLabel('OFF').setStyle(ButtonStyle.Danger),
          )
      ],
      fetchReply: true
    });
  
    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 }); 

    let expression = '';

    collector.on('collect', async i => {
      if (i.customId === 'AC') {
        expression = '';
      } else if (i.customId === 'DEL') {
        expression = expression.slice(0, -1);
      } else if (i.customId === '=') {
        try {
          // Fix for sqrt function with unclosed parenthesis
          if (expression.includes('Math.sqrt(') && !expression.includes(')')) {
            expression += ')';
          }
          expression = eval(expression).toString();
        } catch {
          expression = 'Error';
        }
      } else if (i.customId === 'OFF') {
        collector.stop('user ended session');
        return interaction.deleteReply();
      } else if (i.customId === '^') {
        expression += '**';
      } else if (i.customId === '√') {
        expression += 'Math.sqrt(';
      } else {
        expression += i.customId;
      }

      const updatedEmbed = new EmbedBuilder()
        .setTitle('Calculator')
        .setDescription(`Result: \`${expression || '-'}\``)
        .setFooter({
          text: `Requested By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setColor('#000000');

      await i.update({ embeds: [updatedEmbed] });
    });

    collector.on('end', collected => {
      initialMessage.edit({
        content: 'Calculator session ended. Please reuse the command to initiate the session again.',
        components: []
      })
    });
  }
};
