const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'deafen',
  description: 'Deafen a member in your current voice channel.',
  category: 'voice',
  options: [
    {
      name: 'user',
      description: 'The user to deafen',
      type: 6,
      required: true
    }
  ],

  async run(client, interaction) {
    const clientColor = client.color || '#FFFFFF';

    if (!interaction.member) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription('Unable to determine your member details. Please try again.')
        ],
        ephemeral: true
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription('You must have the `Deafen Members` permission to use this command.')
        ],
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription('I must have the `Deafen Members` permission to use this command.')
        ],
        ephemeral: true
      });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription('You must be connected to a voice channel first.')
        ],
        ephemeral: true
      });
    }

    const member = interaction.options.getMember('user');

    if (!member || !member.voice.channel || member.voice.channel.id !== interaction.member.voice.channel.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription('You must mention someone who is in your voice channel to deafen.')
        ],
        ephemeral: true
      });
    }

    try {
      await member.voice.setDeaf(true, `${interaction.user.tag} (${interaction.user.id})`);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setDescription(`Successfully deafened <@${member.id}> from voice!`)
        ]
      });
    } catch (err) {
      console.error("Error deafening member:", err);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(clientColor)
          .setTitle('Error')
          .setDescription(`Unable to deafen <@${member.id}> from voice.`)
        ],
        ephemeral: true
      });
    }
  }
};
