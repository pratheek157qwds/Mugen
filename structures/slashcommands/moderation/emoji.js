const { Client, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../../configuration/index");
const axios = require('axios');

module.exports = {
    name: "emoji",
    description: "Manage emojis on the server",
    options: [
        {
            name: "add",
            description: "Adds an emoji to the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "What is the emoji? (Either a URL or the emoji itself)",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "name",
                    description: "What should the emoji be named?",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
        {
            name: "remove",
            description: "Removes an emoji from the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "The emoji to remove (either emoji ID or name)",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return interaction.reply({ content: "I need the 'Manage Emojis And Stickers' permission to manage emojis.", ephemeral: true });
        }

        if (!config.developers.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            let emojiUrl = interaction.options.getString('emoji').trim();
            const name = interaction.options.getString('name');

            if (emojiUrl.startsWith("<") && emojiUrl.endsWith(">")) {
                const id = emojiUrl.match(/\d{15,}/g)[0];

                try {
                    await axios.head(`https://cdn.discordapp.com/emojis/${id}.gif`);
                    emojiUrl = `https://cdn.discordapp.com/emojis/${id}.gif?quality=lossless`;
                } catch (error) {
                    emojiUrl = `https://cdn.discordapp.com/emojis/${id}.png?quality=lossless`;
                }
            } else if (/^[\u0000-\uFFFF]+$/.test(emojiUrl)) {
                return interaction.reply({ content: "You can't add Unicode emojis directly, please use a custom emoji URL or ID.", ephemeral: true });
            }

            try {
                const newEmoji = await interaction.guild.emojis.create({ attachment: emojiUrl, name: name });

                const embed = new EmbedBuilder()
                    .setTitle("Emoji Added ✅")
                    .setDescription(`New emoji added ${newEmoji.toString()} with the name **${newEmoji.name}**`)
                    .setColor("Green");

                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error("Error adding emoji:", error);
                return interaction.reply({ content: `Could not add the emoji. Make sure the URL is valid and I have permissions.`, ephemeral: true });
            }
        } else if (subcommand === "remove") {
            const emojiIdentifier = interaction.options.getString('emoji');

            try {
                const emojiIdMatch = emojiIdentifier.match(/<a?:\w+:(\d+)>/);
                const emojiId = emojiIdMatch ? emojiIdMatch[1] : emojiIdentifier;

                let emoji = interaction.guild.emojis.cache.find(e => e.id === emojiId);
                if (!emoji) {
                    emoji = await interaction.guild.emojis.fetch(emojiId);
                }

                if (!emoji) {
                    return interaction.reply({ content: `Could not find emoji with ID ${emojiId}.`, ephemeral: true });
                }

                await emoji.delete();

                const embed = new EmbedBuilder()
                    .setTitle("Emoji Removed ❌")
                    .setDescription(`Emoji **${emoji.name}** has been removed successfully.`)
                    .setColor(0xFF0000);

                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error("Error removing emoji:", error);
                return interaction.reply({ content: `Could not remove the emoji. Please try again later.`, ephemeral: true });
            }
        }
    }
};
