const { Client, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "nick",
    description: "Change the nickname of a user",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionType.User,
            description: "The user whose nickname you want to change",
            required: true
        },
        {
            name: "nickname",
            type: ApplicationCommandOptionType.String,
            description: "The new nickname",
            required: true
        }
    ],

    run: async (client, interaction) => {
        const user = interaction.options.getUser("user");
        const newNickname = interaction.options.getString("nickname");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('User not found in this guild.')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const oldNickname = member.nickname || user.username;

        try {
            await member.setNickname(newNickname);
            const successEmbed = new EmbedBuilder()
                .setTitle('Nickname Changed')
                .setDescription(`Successfully changed nickname of **${oldNickname}** to **${newNickname}** for ${user}.`)
                .setColor('#00FF00');
            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error changing nickname:', error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('There was an error changing the nickname. Please ensure I have the appropriate permissions.')
                .setColor('#FF0000');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
