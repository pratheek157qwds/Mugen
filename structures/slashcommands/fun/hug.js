const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../configuration/index");
const neko = new (require('nekos.life'))();

module.exports = {
  name: "hug",
  description: "Hug a user.",
  options: [
    {
      name: "user",
      description: "Which user to hug?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],

  async run(client, interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({ content: "I don't have permission to send messages in this channel.", ephemeral: true });
    }

    if (!config.developers.includes(interaction.user.id) && !interaction.member?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }

    try {
      const user = interaction.options.getMember("user");

      const hugData = await neko.hug(); 

      const hugEmbed = new EmbedBuilder()
        .setTitle(`${user.user.username}, you've been hugged!`)
        .setColor("Random")
        .setDescription(`${interaction.user} hugged ${user}`)
        .setImage(hugData.url)
        .setTimestamp();

      interaction.reply({ embeds: [hugEmbed] });
    } catch (error) {
      console.error(`Error in ${module.exports.name} command:`, error);
      interaction.reply({ content: "An error occurred while fetching the hug image. Please try again later.", ephemeral: true });
    }
  },
};
