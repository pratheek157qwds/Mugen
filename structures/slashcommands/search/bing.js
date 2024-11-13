const { CommandInteraction, PermissionsBitField, EmbedBuilder, Client, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "bingsearch",
    description: "Search the web using Bing",
    options: [
        {
            name: "name",
            description: "The search query",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: `Current permissions on this server do not allow me to use this command`, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
        }

        let name = encodeURIComponent(interaction.options.getString('name'));
        let link = `https://www.bing.com/search?q=${name}`;

        const embed = new EmbedBuilder()
            .setTitle(`Search Results for: ${name}`)
            .setColor("#F71D0A")
            .addFields([
                {
                    name: `🔗┇Link`,
                    value: `[Click here to see the link](${link})`,
                    inline: true,
                }
            ])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
