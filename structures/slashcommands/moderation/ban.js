const { Client, CommandInteraction, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a member from the server',
    options: [
        {
            name: 'member',
            description: 'The member to ban',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for banning the member',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const moderator = interaction.user.tag;
        const moderatorMention = `<@${interaction.user.id}>`;
        const moderatorProfileURL = `https://discord.com/users/${interaction.user.id}`;
        const serverName = interaction.guild.name;
        const currentTime = new Date().toLocaleString();

        const abusiveReplies = [
            "Who do you think you are, trying to use this command?",
            "Nice try, but you don't have the power here.",
            "Stick to your lane, buddy. You're not allowed to use this command.",
            "Don't even think about it. You can't use this command.",
            "Know your place! This command isn't for you.",
            "Back off! You don't have the permissions to use this.",
            "Stay in your lane! You can't use this command."
        ];

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const abusiveReply = abusiveReplies[Math.floor(Math.random() * abusiveReplies.length)];
            return interaction.reply({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Permission Denied',
                    description: abusiveReply,
                }],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const botMember = await interaction.guild.members.fetch(client.user.id);

            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.followUp({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Error',
                        description: `I don't have permission to ban members.`,
                    }]
                });
            }

            if (!member || !member.bannable) {
                return interaction.followUp({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Error',
                        description: `I cannot ban ${member ? member.user.tag : 'this user'} because they have a higher role or I lack permissions.`,
                    }]
                });
            }

            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Mugen Ban Tool')
                .setDescription(`You were banned from **${serverName}**`)
                .addFields(
                    { name: 'Server', value: serverName, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { 
                        name: 'Moderator', 
                        value: `${moderatorMention}\n[${moderator}](${moderatorProfileURL})`,
                        inline: true 
                    }
                )
                .setFooter({ text: `Banned from ${serverName} | Developed by pratheek reddy • ${currentTime}` });

            try {
                await member.send({ embeds: [banEmbed] });
            } catch (error) {
                console.error(`Could not send a DM to ${member.user.tag}:`, error);
            }

            await member.ban({ reason });

            await interaction.followUp({
                embeds: [{
                    color: 0x00FF00,
                    title: 'Member Banned',
                    description: `${member.user.tag} has been banned from the server.\nReason: ${reason}`,
                }]
            });

        } catch (error) {
            console.error('An error occurred while processing the ban command:', error);
            await interaction.followUp({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Error',
                    description: `An error occurred while processing your request.`,
                }]
            });
        }
    },
};
