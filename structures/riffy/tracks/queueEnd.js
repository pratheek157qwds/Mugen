const client = require("../../client");
const { EmbedBuilder } = require("discord.js");

client.riffy.on("queueEnd", async (player) => {
    const channel = client.channels.cache.get(player.textChannel);

    if (player.isAutoplay) {
        player.autoplay(player);
    } else {
        const queueEndEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("Queue Ended")
            .setDescription("There are no more songs in the queue.");

        channel.send({ embeds: [queueEndEmbed] });
        player.destroy();
    }
});
