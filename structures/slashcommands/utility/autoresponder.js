const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'autoresponder',
  description: 'Manage autoresponders for this server',
  options: [
    {
      name: 'create',
      description: 'Create a new autoresponder',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'trigger',
          description: 'Trigger word/phrase',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'response',
          description: 'Response text',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'attachment',
          description: 'Response attachment URL',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'delete',
      description: 'Delete an autoresponder',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'trigger',
          description: 'Trigger word/phrase to delete',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'edit',
      description: 'Edit an existing autoresponder',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'trigger',
          description: 'Trigger word/phrase to edit',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'new_response',
          description: 'New response text',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'new_attachment',
          description: 'New response attachment URL',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'config',
      description: 'List all autoresponders for this server',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'create') {
      const trigger = interaction.options.getString('trigger');
      const response = interaction.options.getString('response');
      const attachment = interaction.options.getString('attachment');

      await db.set(`autoresponder_${guildId}_${trigger}`, { response, attachment });

      const embed = new EmbedBuilder()
        .setTitle('Autoresponder Created')
        .setDescription(`Successfully created autoresponder in **${interaction.guild.name}** with the trigger \`${trigger}\``)
        .setColor('#00ff00');

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (subcommand === 'delete') {
      const trigger = interaction.options.getString('trigger');

      await db.delete(`autoresponder_${guildId}_${trigger}`);

      const embed = new EmbedBuilder()
        .setTitle('Autoresponder Deleted')
        .setDescription(`Successfully deleted autoresponder in **${interaction.guild.name}** with the trigger \`${trigger}\``)
        .setColor('#ff0000');

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (subcommand === 'edit') {
      const trigger = interaction.options.getString('trigger');
      const newResponse = interaction.options.getString('new_response');
      const newAttachment = interaction.options.getString('new_attachment');

      const existingResponder = await db.get(`autoresponder_${guildId}_${trigger}`);
      if (!existingResponder) {
        const embed = new EmbedBuilder()
          .setTitle('Autoresponder Not Found')
          .setDescription(`No autoresponder found in **${interaction.guild.name}** with the trigger \`${trigger}\``)
          .setColor('#ffa500');

        return await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }

      const updatedResponder = {
        response: newResponse || existingResponder.response,
        attachment: newAttachment || existingResponder.attachment,
      };

      await db.set(`autoresponder_${guildId}_${trigger}`, updatedResponder);

      const embed = new EmbedBuilder()
        .setTitle('Autoresponder Edited')
        .setDescription(`Successfully edited autoresponder in **${interaction.guild.name}** with the trigger \`${trigger}\``)
        .setColor('#0000ff');

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (subcommand === 'config') {
      const keys = await db.all();
      const guildKeys = keys.filter(key => key.id.startsWith(`autoresponder_${guildId}_`));
      const triggers = guildKeys.map(key => key.id.split(`autoresponder_${guildId}_`)[1]);

      const embed = new EmbedBuilder()
        .setTitle(`Autoresponders in ${interaction.guild.name}`)
        .setDescription(triggers.length ? triggers.map((trigger, index) => `\`${index + 1}. ${trigger}\``).join('\n') : 'No autoresponders found')
        .setColor('#000000');

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};

// In your main bot file, ensure the client event handler is correctly referencing client
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const guildId = message.guild.id;
  const content = message.content.toLowerCase();
  
  const keys = await db.all();
  const guildKeys = keys.filter(key => key.id.startsWith(`autoresponder_${guildId}_`));

  for (const key of guildKeys) {
    const trigger = key.id.split(`autoresponder_${guildId}_`)[1].toLowerCase();

    if (content.includes(trigger)) {
      const { response, attachment } = await db.get(key.id);
      
      if (response && attachment) {
        await message.channel.send({ content: response, files: [attachment] });
      } else if (response) {
        await message.channel.send(response);
      } else if (attachment) {
        await message.channel.send({ files: [attachment] });
      }

      break;
    }
  }
});