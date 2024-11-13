const { Client, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'membercount', // Command name (v12 and below)
  description: 'Displays member count and status distribution in the guild',

  async run(client, interaction) {
    try {
      if (!interaction.guild) { 
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      }

      const updateCounts = () => {
        let onlineMembers = 0, idleMembers = 0, dndMembers = 0, offlineMembers = 0;
        const guildMembers = interaction.guild.members.cache;
        guildMembers.forEach(member => {
          const presence = member.presence;
          if (presence?.status === 'online') onlineMembers++;
          else if (presence?.status === 'idle') idleMembers++;
          else if (presence?.status === 'dnd') dndMembers++;
          else offlineMembers++;
        });

        const totalMembers = interaction.guild.memberCount;
        const guildIcon = interaction.guild.iconURL({ dynamic: true, format: 'png' });

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`${interaction.guild.name} Member Count`)
          .setDescription(`
            **Total Members**: ${totalMembers}
          `)
          .setThumbnail(guildIcon);

        // Edit the initial reply or send a new reply if none exists
        if (interaction.replied || interaction.deferred) {
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.reply({ embeds: [embed] });
        }
      };

      // Initial count and presence update listener
      updateCounts();

      const presenceUpdateListener = (oldPresence, newPresence) => {
        if (newPresence.guild.id !== interaction.guild.id) return; 
        updateCounts();
      };

      client.on('presenceUpdate', presenceUpdateListener);

      // No automatic message deletion here 

    } catch (error) {
      console.error('Error handling member count command:', error);
      interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    }
  },
};
