const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'rockpaperscissors',
  description: 'Challenge another user to a game of Rock Paper Scissors',
  options: [{
    name: 'opponent',
    description: 'The user you want to challenge',
    type: 6, 
    required: true
  }],
  run: async (client, interaction) => {
    const opponent = interaction.options.getUser('opponent');

    if (opponent.bot) return interaction.reply({ content: "You can't challenge a bot!", ephemeral: true });
    if (opponent.id === interaction.user.id) return interaction.reply({ content: "You can't challenge yourself!", ephemeral: true });

    const challengeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Rock Paper Scissors Challenge')
      .setDescription(`${interaction.user} has challenged you to a game of Rock Paper Scissors, ${opponent}!`);

    const challengeButtons = new ActionRowBuilder()
      .addComponents([
        new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('reject').setLabel('Reject').setStyle(ButtonStyle.Danger)
      ]);

    const challengeMessage = await interaction.reply({ embeds: [challengeEmbed], components: [challengeButtons], fetchReply: true });
    const challengeCollector = challengeMessage.createMessageComponentCollector({ filter: (i) => ['accept', 'reject'].includes(i.customId), time: 60000 }); 

    challengeCollector.on('collect', async (i) => {
      if (i.user.id !== opponent.id) return i.reply({ content: "You cant accept this", ephemeral: true });

      if (i.customId === 'reject') {
        challengeCollector.stop();
        return i.update({ content: `${opponent} has declined the challenge.`, embeds: [], components: [] });
      }

      const choices = ['rock', 'paper', 'scissors'];
      const userChoices = {}; 

      const gameEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Rock Paper Scissors')
        .setDescription(`Make your choice!\n\n${interaction.user}: No choice yet\n${opponent}: No choice yet`);
      const gameButtons = new ActionRowBuilder()
        .addComponents(choices.map(choice => new ButtonBuilder().setCustomId(choice).setLabel(choice.charAt(0).toUpperCase() + choice.slice(1)).setStyle(ButtonStyle.Secondary)));

      await i.update({ embeds: [gameEmbed], components: [gameButtons] });
      const gameCollector = challengeMessage.createMessageComponentCollector({ filter: (btn) => [interaction.user.id, opponent.id].includes(btn.user.id) && !userChoices[btn.user.id] });

      gameCollector.on('collect', async (btn) => {
        userChoices[btn.user.id] = btn.customId;
        const updatedEmbed = gameEmbed.setDescription(`Make your choice!\n\n${interaction.user}: ${userChoices[interaction.user.id] || 'No choice yet'}\n${opponent}: ${userChoices[opponent.id] || 'No choice yet'}`);
        await btn.update({ embeds: [updatedEmbed], components: [gameButtons] }); 

        if (userChoices[interaction.user.id] && userChoices[opponent.id]) {
          gameCollector.stop();
          await determineWinner(interaction, interaction.user, opponent, userChoices[interaction.user.id], userChoices[opponent.id]);
          challengeCollector.stop(); 
        }
      });
    });
      
    challengeCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: 'Challenge timed out.', embeds: [], components: [] });
      }
    });
  }
};

function determineWinner(interaction, user, opponent, userChoice, opponentChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    const results = {
        'rock': { 'rock': 'Tie', 'paper': opponent, 'scissors': user },
        'paper': { 'rock': user, 'paper': 'Tie', 'scissors': opponent },
        'scissors': { 'rock': opponent, 'paper': user, 'scissors': 'Tie' }
    };
    
    const winner = results[userChoice][opponentChoice];
    const resultMessage = winner === 'Tie' ? "It's a tie! 🤝" : `🎉 ${winner} wins! 🎉`;

    const resultEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Rock Paper Scissors Result')
        .setDescription(`${user} chose ${userChoice}\n${opponent} chose ${opponentChoice}\n\n${resultMessage}`);

    interaction.editReply({ embeds: [resultEmbed], components: [] });
}
