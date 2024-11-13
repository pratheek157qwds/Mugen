const { CommandInteraction, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, SelectMenuBuilder, ApplicationCommandOptionType, italic } = require("discord.js");
const axios = require("axios")
const moment = require('moment');
moment.locale('fr');

module.exports = {
    name: "banner",
    description: "Shows the banner of selected user",
    options: [
        {
            name: "user",
            description: "Select The User.",
            required: true,
            type: ApplicationCommandOptionType.User,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) return interaction.reply({ content: `The current permissions on this server do not allow me to use this command.`, ephemeral: true })
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) return interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true })
        
        const member = interaction.options.getMember("user");


        axios.get(`https://discord.com/api/users/${member.id}`, {

            headers: {
                Authorization: `Bot ${client.token}`
            },
        }).then(async (res) => {
            const { banner } = res.data

            if (banner) {
                const extension = banner.startsWith("a_") ? '.gif' : '.png'
                const image = `https://cdn.discordapp.com/banners/${member.id}/${banner}${extension}?size=2048`;

                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag}`)
                    .setImage(image)
                    .setColor("#F71D0A")
                await interaction.reply({ embeds: [embed]});

            }else{
                return interaction.reply({content: `This member does not have a banner`, ephemeral: true})
            }
        })
    }
}