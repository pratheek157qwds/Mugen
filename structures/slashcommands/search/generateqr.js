const { Client, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const QRCode = require('qrcode');
const { Readable } = require('stream');

module.exports = {
    name: "generate-qr",
    description: "Generates a QR code for a given link",
    options: [
        {
            name: "link",
            type: ApplicationCommandOptionType.String,
            description: "The link to generate a QR code for",
            required: true
        }
    ],

    run: async (client, interaction) => {
        const link = interaction.options.getString("link");

        try {
            // Generate QR code
            const qrCodeDataURL = await QRCode.toDataURL(link);
            const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const attachment = new AttachmentBuilder(buffer, { name: 'qrcode.png' });

            // Send the QR code image
            await interaction.reply({ files: [attachment] });

            // Create the embed with the link
            const qrEmbed = new EmbedBuilder()
                .setDescription(`QR Code For [Your Link!](${link})`)
                .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('#000000');

            // Send the embed separately
            await interaction.followUp({ embeds: [qrEmbed] });
        } catch (error) {
            console.error('Error generating QR code:', error);
            await interaction.reply({ content: 'There was an error generating the QR code. Please try again later.', ephemeral: true });
        }
    }
};
