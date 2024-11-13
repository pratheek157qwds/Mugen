const { SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField} = require("discord.js");
const config = require ('../../configuration/index');
const neko = new (require('nekos.life'))();

module.exports = {
  name: "kiss",
  description: "Kiss a user.",
  options: [
    {
      name: "user",
      description: "Which user to kiss?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],

  async run(client, interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) 
      return interaction.reply({ content: `I don't have permission to send messages in this channel.`, ephemeral: true });

    if (!config.developers.includes(interaction.user.id) && !interaction.member?.permissions.has(PermissionsBitField.Flags.SendMessages)) 
      return interaction.reply({ content: `You don't have permission to use this command.`, ephemeral: true });

    try {
      const user = interaction.options.getMember("user");
      const kissData = await neko.kiss();

      const kissEmbed = new EmbedBuilder()
        .setTitle(`${user.user.username}, you've been kissed!`)
        .setColor("Random")
        .setDescription(`${interaction.user} kissed ${user}`)
        .setImage(kissData.url)
        .setTimestamp();

      return interaction.reply({ embeds: [kissEmbed] });
    } catch (err) {
      console.error(`Error in ${module.exports.name} command:`, err);
      return interaction.reply({ content: "An error occurred while fetching the kiss image. Please try again later.", ephemeral: true });
    }
  },
};
