const HMtai = require('hmtai');
const { EmbedBuilder } = require('discord.js');
const hmtai = new HMtai();

module.exports = {
    name: 'wallpaper',
    description: 'Fetches wallpapers based on the provided category.',
    options: [
        {
            name: 'category',
            description: 'The category of wallpaper to fetch',
            type: 3,
            required: true,
            choices: [
                { name: 'Mobile SFW', value: 'mobileSfw' },
                { name: 'Mobile NSFW', value: 'mobileNsfw' },
            ]
        }
    ],
    run: async (client, interaction) => {
        const category = interaction.options.getString('category');
        if (!interaction.channel.nsfw && (category === 'mobileNsfw' || category === 'desktopNsfw')) {
            return interaction.reply({ 
                content: 'This command can only be used in NSFW channels.', 
                ephemeral: true 
            });
        }
        try {
            let imageUrl;

            switch (category) {
                case 'mobileSfw':
                    imageUrl = await hmtai.sfw.mobileWallpaper();
                    break;
                case 'desktopSfw':
                    imageUrl = await hmtai.sfw.Wallpaper();
                    break;
                case 'mobileNsfw':
                    imageUrl = await hmtai.nsfw.nsfwMobileWallpaper();
                    break;
                case 'desktopNsfw':
                    imageUrl = await hmtai.nsfw.nsfwWallapaper();
                    break;
                default:
                    return interaction.reply('Invalid category!');
            }

            const embed = new EmbedBuilder()
                .setColor('#3498DB') 
                .setTitle(`Here is your ${category} wallpaper`)
                .setImage(imageUrl)
                .setFooter({ text: 'Enjoy your wallpaper', iconURL: 'https://i.imgur.com/5F4f1tU.png' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching wallpaper:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription(`Failed to fetch wallpaper for category ${category}. Please try again later.`)
                .setFooter({ text: 'Error', iconURL: 'https://i.imgur.com/3Zotwgj.png' })
                .setTimestamp();

            return interaction.reply({ embeds: [errorEmbed] });
        }
    }
};
