const { Client, CommandInteraction, ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = {
    name: 'userinfo',
    description: 'Displays detailed information about a user.',
    options: [
        {
            name: 'target',
            description: 'Select a user',
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);

            const imageBuffer = await profileImage(user.id, {
                borderColor: ['#ff5733', '#33ff57'],
                presenceStatus: member.presence?.status || 'offline',
                badgesFrame: true,
                removeAvatarFrame: false
            });

            const isBoosting = member.premiumSinceTimestamp 
                ? `Yes (Since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>)` 
                : 'No';
            
            const presence = member.presence;
            const activities = presence?.activities || [];
            const activityString = activities.length > 0 ? activities.map(activity => {
                return `${activity.emoji ? `${activity.emoji} ` : ''}**${activity.type}**: ${activity.name}`;
            }).join('\n') : 'None';

            const attachment = new AttachmentBuilder(imageBuffer, { name: 'userinfo-banner.png' });

            const bannerURL = user.bannerURL({ format: 'png', size: 2048 }) || 'No banner';

            const roles = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .first(2)
                .map(role => `<@&${role.id}>`)
                .join(', ') || 'None';

            const userInfoEmbed = new EmbedBuilder()
                .setTitle(`${user.username}'s Info`)
                .setDescription('Here is the detailed information about the user.')
                .setColor('#2f3136')
                .setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true }))
                .addFields(
                    { name: 'User Info', value: [
                        `<:mugen_user:1278033367354310676> **User:** <@${user.id}>`,
                        `🔤 **Username:** \`${user.username}\``,
                        `🤖 **Bot:** ${user.bot ? 'Yes' : 'No'}`,
                        `🖼️ **Avatar:** [Link](${user.displayAvatarURL({ format: 'png', dynamic: true })})`,
                        `🎨 **Banner:** ${bannerURL !== 'No banner' ? `[Link](${bannerURL})` : 'No banner'}`,
                        `<a:mugen_status:1278030342225133608> **Status:** ${member.presence?.status || '`offline`'}`,
                    ].join('\n - ') },
                    { name: `<:mugen_members:1278033707206316043> Member Info`, value: [
                        `📅 **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                        `🏷️ **Display Name:** ${member.displayName}`,
                        `🔝 **Top Roles:** ${roles}`,
                        `<a:mugen_booster:1278038849892651090> **Server Booster:** ${isBoosting}`,
                        `📆 **Joined Discord At:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                        `<:mugen_security:1278030981533532252> **Security:** ${member.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}`,
                    ].join('\n - ') },
                    { name: `<a:mugen_status:1278030342225133608> Status`, value: [
                        `- 🗽 **Current Status:** ${presence?.status || 'Offline'}`,
                        `<a:mugen_activity:1278030121810530304> **Activity:** ${activityString}`,
                    ].join('\n - '), inline: true }
                )
                .setImage('attachment://userinfo-banner.png')
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.editReply({ embeds: [userInfoEmbed], files: [attachment] });
        } catch (error) {
            console.error('Error executing userinfo command:', error);
            await interaction.editReply({ content: 'There was an error processing this command.', ephemeral: true });
        }
    },
};
