const { CommandInteraction, PermissionsBitField, EmbedBuilder, Client, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
  name: "roleall",
  description: "Add a role to all users & bots",
  owner: false, 
  options: [
    {
      name: "role",
      description: "Which role to add?",
      required: true,
      type: ApplicationCommandOptionType.Role, 
    },
  ],

  run: async (client, interaction) => {
    // Permission checks
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "**❌ I don't have sufficient permissions to execute this command.**", ephemeral: true });
    }

    if (!config.developers.includes(interaction.user.id) && !interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "**❌ You don't have permission to use this command.**", ephemeral: true });
    }

    try {
      const role = interaction.options.getRole("role");
      const startTime = Date.now();
      const members = await interaction.guild.members.fetch(); // Fetch all members
      const totalMembers = members.size;
      const rateLimitDelay = 10000 / 30; // Discord's rate limit is around 30 requests per 10 seconds
      let processedMembers = 0;

      const embed = new EmbedBuilder()
        .setTitle("Adding Role to Members")
        .setDescription(`Adding the role ${role} to all ${totalMembers} members.`)
        .setColor("Blue")
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      for (const [, member] of members) {
        try {
          await member.roles.add(role);
          processedMembers++;

          embed.setDescription(`Adding the role ${role} to all ${totalMembers} members.\n\nProgress: ${processedMembers}/${totalMembers}\n\nEstimated Time Remaining: ${Math.round(((totalMembers - processedMembers) * rateLimitDelay) / 1000)} seconds`);

          if (processedMembers % 10 === 0) { 
            await interaction.editReply({ embeds: [embed] });
          }
          await new Promise(resolve => setTimeout(resolve, rateLimitDelay)); 
        } catch (memberError) {
          console.error(`Error adding role to ${member.user.tag}:`, memberError);
          // You can add more specific error handling here if needed.
        }
      }

      embed.setDescription(`Finished attempting to add role ${role} to all members.`);
      embed.setColor("Green");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error); 

      const errorEmbed = new EmbedBuilder()
        .setTitle("Error Adding Role")
        .setDescription(`An error occurred while adding the role. Please try again later.`)
        .setColor("Red");
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
