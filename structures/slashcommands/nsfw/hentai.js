const Discord = require('discord.js');
const NSFW = require('discord-nsfw');
const nsfw = new NSFW();
const lewd = require('discord-hentai');
const anime = lewd.Anime;

const uniqueChoices = [
  { name: 'Anal', value: 'anal' },
  { name: '4K', value: 'fourk' },
  { name: 'Ass', value: 'ass' },
  { name: 'Gonewild', value: 'gonewild' },
  { name: 'Porngif', value: 'pgif' },
  { name: 'Pussy', value: 'pussy' },
  { name: 'Thigh', value: 'thigh' },
  { name: 'Boobs', value: 'boobs' },
  { name: 'Hentai Ass', value: 'hentaiass' },
  { name: 'Hentai', value: 'hentai' },
  { name: 'Hentai Midriff', value: 'hmidriff' },
  { name: 'Hentai Thigh', value: 'hentaithigh' },
  { name: 'Erokemo', value: 'erokemo' },
  { name: 'Kitsune', value: 'kitsune' },
  { name: 'Lewd', value: 'lewd' },
  { name: 'Solo', value: 'solo' },
  { name: 'Hanal', value: 'hanal' },
  { name: 'Neko', value: 'neko' },
  { name: 'Holo', value: 'holo' },
  { name: 'Lesbian', value: 'lesbian' }
];

module.exports = {
  name: 'hentai',
  description: 'Fetches lewd anime images based on the provided category.',
  options: [
    {
      name: 'category',
      description: 'The category of hentai images to fetch',
      type: 3,
      required: true,
      choices: uniqueChoices
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.channel.nsfw) {
      const embed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('NSFW Command')
        .setDescription('This command can only be used in NSFW channels!\n\nTo enable age restriction:\n1. Go to your server settings.\n2. Select "Overview".\n3. Scroll down to "NSFW Channel".\n4. Toggle the "NSFW Channel" switch.')
        .setFooter({ text: 'NSFW Warning', iconURL: 'https://i.imgur.com/wSTFkRM.png' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const category = interaction.options.getString('category');
    let imageUrl;

    try {
      switch (category) {
        case 'anal':
          imageUrl = await nsfw.anal();
          break;
        case 'swimsuit':
          imageUrl = await anime.swimsuit();
          break;
        case 'fourk':
          imageUrl = await nsfw.fourk();
          break;
        case 'thigh':
          imageUrl = await nsfw.thigh();
          break;
        case 'ass':
          imageUrl = await nsfw.ass();
          break;
        case 'gonewild':
          imageUrl = await nsfw.gonewild();
          break;
        case 'pgif':
          imageUrl = await nsfw.pgif();
          break;
        case 'pussy':
          imageUrl = await nsfw.pussy();
          break;
        case 'boobs':
          imageUrl = await nsfw.boobs();
          break;
        case 'hentaiass':
          imageUrl = await nsfw.hentaiass();
          break;
        case 'hentai':
          imageUrl = await nsfw.hentai();
          break;
        case 'hmidriff':
          imageUrl = await nsfw.hmidriff();
          break;
        case 'hentaithigh':
          imageUrl = await nsfw.hentaithigh();
          break;
        case 'erokemo':
          imageUrl = await nsfw.erokemo();
          break;
        case 'kitsune':
          imageUrl = await nsfw.kitsune();
          break;
        case 'lewd':
          imageUrl = await nsfw.lewd();
          break;
        case 'solo':
          imageUrl = await nsfw.solo();
          break;
        case 'hanal':
          imageUrl = await anime.hanal();
          break;
        case 'neko':
          imageUrl = await anime.neko();
          break;
        case 'holo':
          imageUrl = await anime.holo();
          break;
        case 'lesbian':
          imageUrl = await anime.lesbian();
          break;
        default:
          return interaction.reply('Invalid category!');
      }

      const embed = new Discord.EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`Here is your ${category} image`)
        .setImage(imageUrl)
        .setFooter({ text: 'Enjoy your image', iconURL: 'https://i.imgur.com/5F4f1tU.png' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription(`Failed to fetch image for category ${category}. Please try again later.`)
        .setFooter({ text: 'Error', iconURL: 'https://i.imgur.com/3Zotwgj.png' })
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed] });
    }
  }
};
