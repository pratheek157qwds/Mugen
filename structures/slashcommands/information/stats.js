const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const os = require('os');

module.exports = {
  name: 'stats',
  description: 'View bot statistics and system information.',
  category: 'info',

  async run(client, interaction) {
    const clientColor = client.color || '#FFFFFF'; 

    // Bot Statistics
    const uptime = Math.round(process.uptime() * 1000); 
    const guilds = client.guilds.cache.size;
    const members = client.users.cache.size;
    const channels = client.channels.cache.size;
    
    // System Statistics
    const totalMemoryBytes = os.totalmem();
    const cpuCount = os.cpus().length;
    const freeMemoryBytes = os.freemem();
    const memoryUsageBytes = totalMemoryBytes - freeMemoryBytes;
    const totalMemoryGB = (totalMemoryBytes / (1024 * 1024 * 1024)).toFixed(2);
    const memoryUsageGB = (memoryUsageBytes / (1024 * 1024 * 1024)).toFixed(2);
    const processors = os.cpus();
    const cpuUsage = process.cpuUsage();

    // Combined Stats Embed
    const embed = new EmbedBuilder()
      .setColor(clientColor)
      .setTitle('lord Information')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields([
        { name: 'General Information', value: `
          Bot's Mention: <@${client.user.id}>
          Bot's Tag: ${client.user.tag}
          Bot's Version: 1.0.0
          Total Servers: ${guilds}
          Total Users: ${members}
          Total Channels: ${channels}
          Uptime: ${moment.duration(uptime).humanize()}
        `},
        { name: 'System Information', value: `
          System Latency: ${client.ws.ping}ms
          Platform: ${process.platform}
          Architecture: ${process.arch}
          Memory Usage: ${memoryUsageGB} GB / ${totalMemoryGB} GB
          CPU Usage: ${(cpuUsage.system / 1000 + cpuUsage.user / 1000).toFixed(2)}%
          Processor Model: ${processors[0].model}
          Processor Speed: ${processors[0].speed} MHz
        `}
      ])
      .setTimestamp() // Adds a timestamp to the embed
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    interaction.reply({ embeds: [embed] }); 
  }
};
