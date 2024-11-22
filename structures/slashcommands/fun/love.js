const { Client, ApplicationCommandOptionType, PermissionsBitField, CommandInteraction, EmbedBuilder } = require("discord.js");
const config = require("../../configuration/index");
const neko = new (require('nekos.life'))();

module.exports = {
  name: "love",
  description: "See the love percentage between two users.",
  options: [
    {
      name: "user",
      description: "Which user to calculate love percentage with?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],

  async run(client, interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) 
      return interaction.reply({ content: `I don't have permissions to perform this command.`, ephemeral: true });

    if (!config.developers.includes(interaction.user.id) && !interaction.member?.permissions.has(PermissionsBitField.Flags.SendMessages)) 
      return interaction.reply({ content: `You don't have permissions to perform this command.`, ephemeral: true });

    try {
      const user = interaction.options.getMember("user");

      async function work() {
        let hugImage = (await neko.hug());

        const love = Math.round(Math.random() * 100);

        const loveEmbed = new EmbedBuilder()
          .setColor("Random")
          .setDescription(`${interaction.user.username} + ${user} = ${love}% love!`)
          .setThumbnail(`${user.displayAvatarURL({dynamic: true})}`)
          .setImage(hugImage.url)
          .setTimestamp();
        return interaction.reply({ embeds: [loveEmbed] });
      }
      work();
    } catch (err) {
      console.log("An error occurred", err);
    }
  },
};
