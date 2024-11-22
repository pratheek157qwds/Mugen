const { CommandInteraction, PermissionsBitField, EmbedBuilder, Client, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../configuration/index");

module.exports = {
    name: "removeroleall",
    description: "Remove a role from all users & bots",
    owner: false,
    options: [
        {
            name: "role",
            description: "Which role to remove?",
            required: true,
            type: ApplicationCommandOptionType.Role,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "**❌ I don't have sufficient permissions to execute this command.**", ephemeral: true });
        }
        
        if (!config.developers.includes(interaction.user.id) && !interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "**❌ You don't have permission to use this command.**", ephemeral: true });
        }

        try {
            const role = interaction.options.getRole("role");
            const members = await interaction.guild.members.fetch();
            const totalMembers = members.size;
            const rateLimitDelay = 10000 / 30;  
            let processedMembers = 0;

            const embed = new EmbedBuilder()
                .setTitle("Removing Role from Members")
                .setDescription(`Removing the role ${role} from all ${totalMembers} members.`)
                .setColor("Blue")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            for (const [, member] of members) {
                if (!member.roles.cache.has(role.id)) continue;
                try {
                    await member.roles.remove(role);
                    processedMembers++;

                    embed.setDescription(`Removing the role ${role} from all ${totalMembers} members.\n\nProgress: ${processedMembers}/${totalMembers}\n\nEstimated Time Remaining: ${Math.round(((totalMembers - processedMembers) * rateLimitDelay) / 1000)} seconds`);

                    if (processedMembers % 10 === 0) {
                        await interaction.editReply({ embeds: [embed] });
                    }
                    await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
                } catch (memberError) {
                    console.error(`Error removing role from ${member.user.tag}:`, memberError);

                    if (memberError.code === 50013) {
                        embed.setDescription(`Finished attempting to remove role ${role}. I lack permissions to modify some members' roles.`);
                        embed.setColor("Yellow");
                        return await interaction.editReply({ embeds: [embed] });
                    } 
                }
            }

            embed.setDescription(`Finished attempting to remove role ${role} from all members.`);
            embed.setColor("Green"); 
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error); 
            const errorEmbed = new EmbedBuilder()
                .setTitle("Error Removing Role")
                .setDescription(`An error occurred while removing the role. Please try again later.`)
                .setColor("Red");
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
