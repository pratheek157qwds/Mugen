const { EmbedBuilder } = require('discord.js');
const config = require("../../configuration/index.js");
module.exports = {
  name: "shuffle",
  category: "Music",
  description: "Shuffle queue",
  inVoice: true,
  sameVoice: true,
  player: true,
  run: async (message, args, client) => {
    const player = client.riffy.players.get(message.guild.id);

    let shuffleEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Shuffled the queue`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setColor(config.color);
    await player.queue.shuffle();
    return message.reply({ embeds: [shuffleEmbed] });
  },
};