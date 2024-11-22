const { Client, Message } = require("discord.js");

module.exports = {
    name: "botrestart",
    description: "Restarts the bot",
    aliases: ['br'],
    developerOnly: true,

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */

    run: async (client, message, args) => {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You do not have permission to restart the bot.");
        }

        await message.reply("Restarting the bot...");

        client.destroy();
        process.exit(0);
    }
};
