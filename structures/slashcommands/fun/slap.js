const { Client, ApplicationCommandOptionType, PermissionsBitField, CommandInteraction, EmbedBuilder } = require("discord.js");
const config = require("../../configuration/index");
const neko = new (require('nekos.life'))(); // Create an instance of the neko.life client

module.exports = {
  name: "slap",
  description: "Slap a user.",
  options: [
    {
      name: "user",
      description: "Which user to slap?",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    // Permission Check: Ensure the bot has permission to send messages
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({ content: `I don't have permission to send messages in this channel.`, ephemeral: true });
    }

    // Owner/Permission Check: Allow only owners or users with "Send Messages" permission
    if (
      !config.developers.includes(interaction.user.id) && 
      !interaction.member?.permissions.has(PermissionsBitField.Flags.SendMessages)
    ) {
      return interaction.reply({ content: `You don't have permission to use this command.`, ephemeral: true });
    }

    try {
      const user = interaction.options.getMember("user");

      async function work() {
        let owo = (await neko.slap());

        const slapEmbed = new EmbedBuilder()
          .setTitle(`${user.user.username}, you have been slapped!`)
          .setColor("Random")
          .setDescription(`${user} was slapped by ${interaction.user}`)
          .setImage(owo.url)
          .setURL(owo.url);

        return interaction.reply({ embeds: [slapEmbed] });
      }
      work();
    } catch (err) {
      console.log("An error occurred", err);
    }
  },
};
