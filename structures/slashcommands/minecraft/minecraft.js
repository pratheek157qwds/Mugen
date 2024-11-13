const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "minecraftstatus",
  description: "Setup or manage Minecraft server status updates",
  options: [
    {
      name: 'setup',
      description: 'Set up server status updates',
      type: 1,
      options: [
        {
          name: 'java_ip',
          description: 'The Java Edition IP of the Minecraft server',
          type: 3,
          required: true
        },
        {
          name: 'pe_ip',
          description: 'The Bedrock Edition IP of the Minecraft server',
          type: 3,
          required: true
        },
        {
          name: 'server_ip',
          description: 'The server IP without domain',
          type: 3,
          required: true
        },
        {
          name: 'port',
          description: 'The port of the Minecraft server (default: 25565)',
          type: 4,
          required: true
        },
        {
          name: 'channel',
          description: 'The channel to send status updates to',
          type: 7,
          required: true
        }
      ]
    }
  ],

  async run(client, interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'You must be an administrator to use this command.', ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === 'setup') {
        const javaIP = interaction.options.getString('java_ip');
        const peIP = interaction.options.getString('pe_ip');
        const serverIP = interaction.options.getString('server_ip');
        const serverPort = interaction.options.getInteger('port') || 25565;
        const statusChannel = interaction.options.getChannel('channel');

        // Create initial status embed
        const embed = new EmbedBuilder()
          .setColor('FFFF00')
          .setTitle('Setting up server status...')
          .setDescription(`Java IP: ${javaIP}\nPE IP: ${peIP}\nServer IP: ${serverIP}\nPort: ${serverPort}`)
          .setFooter({ text: 'Server status will update automatically every 5 minutes from now.' });

        const setupMessage = await statusChannel.send({ embeds: [embed] });

        // Save configuration to database
        await db.set(`minecraft_status_${guildId}`, {
          java_ip: javaIP,
          pe_ip: peIP,
          server_ip: serverIP,
          server_port: serverPort,
          status_channel_id: statusChannel.id,
          status_message_id: setupMessage.id
        });

        // Start updating server status immediately
        updateStatus(guildId, serverIP, javaIP, peIP, serverPort, statusChannel, setupMessage);

        await interaction.reply({ content: `Server status updates setup for Java IP: ${javaIP}, PE IP: ${peIP}, Server IP: ${serverIP}, Port: ${serverPort}, Channel: ${statusChannel}`, ephemeral: true });

      } else {
        await interaction.reply({ content: 'Invalid subcommand. Use `/minecraftstatus setup` to configure.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
    }
  }
};

// Function to update server status
async function updateStatus(guildId, serverIP, javaIP, peIP, serverPort, statusChannel, setupMessage) {
  try {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIP}:${serverPort}`);
        const serverInfo = await response.json();

        const isOnline = serverInfo.online;
        const onlinePlayers = serverInfo.players?.online || 0;
        const maxPlayers = serverInfo.players?.max || "?";
        const playersList = serverInfo.players?.list?.join(", ") || "No players online (players names will not be shown in proxy servers).";
        const version = serverInfo.version;

        let status = isOnline ? `🟢 **Online** - ${onlinePlayers}/${maxPlayers} players` : '🔴 **Offline**';

        const embed = new EmbedBuilder()
          .setColor(isOnline ? '#00FF00' : '#FF0000')
          .setTitle('Minecraft Server Status')
          .setDescription(status)
          .addFields(
            { name: 'Java IP:', value: javaIP },
            { name: 'PE IP:', value: peIP },
            { name: 'Server IP:', value: serverIP },
            { name: 'Port:', value: serverPort.toString() },
            { name: 'Version:', value: version },
            { name: 'Players:', value: playersList }
          )
          .setFooter({ text: 'Server status updates every 5 minutes.' })
          .setTimestamp();

        if (setupMessage) {
          await setupMessage.edit({ embeds: [embed] });
        } else {
          console.error('Setup message not found.');
        }

      } catch (error) {
        console.error(`Failed to fetch server status for guild ${guildId}:`, error);
      }
    }, 300000); // Update every 5 minutes

  } catch (error) {
    console.error(`Failed to start server status updates for guild ${guildId}:`, error);
  }
}
