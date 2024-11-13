const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    description: 'Loop the current track or the entire queue',
    options: [
        {
            name: 'mode',
            description: 'The loop mode to set (1: none, 2: track, 3: queue)',
            type: 4, // 4 is the type for INTEGER in discord.js
            required: true,
            choices: [
                { name: 'None', value: 1 },
                { name: 'Track', value: 2 },
                { name: 'Queue', value: 3 }
            ]
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const mode = interaction.options.getInteger('mode');

        const player = client.riffy.players.get(interaction.guild.id);
        if (!player) {
            return interaction.reply({ content: 'No music is being played!', ephemeral: true });
        }

        let loopMode;
        switch (mode) {
            case 1:
                loopMode = 'none';
                break;
            case 2:
                loopMode = 'track';
                break;
            case 3:
                loopMode = 'queue';
                break;
            default:
                return interaction.reply({ content: 'Invalid loop mode specified.', ephemeral: true });
        }

        player.setLoop(loopMode);

        const loopEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Loop Mode Updated')
            .setDescription(`The loop mode has been set to **${loopMode}**.`);

        return interaction.reply({ embeds: [loopEmbed] });
    }
};
