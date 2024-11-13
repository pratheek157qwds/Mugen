const { CommandInteraction, PermissionsBitField, EmbedBuilder, Client, ApplicationCommandOptionType } = require("discord.js");
const axios = require('axios');

module.exports = {
    name: "crypto",
    description: "Get the current price of a cryptocurrency",
    options: [
        {
            name: "coin",
            description: "The cryptocurrency to get the price for",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "currency",
            description: "The currency to compare the cryptocurrency against",
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

        let coin = interaction.options.getString('coin').toLowerCase();
        let currency = interaction.options.getString('currency').toLowerCase();

        console.log(`Fetching data for coin: ${coin} and currency: ${currency}`);

        try {
            // Fetch supported coins
            const coinsResponse = await axios.get('https://api.coingecko.com/api/v3/coins/list');
            const supportedCoins = coinsResponse.data.map(c => c.id);
            console.log('Supported coins:', supportedCoins);

            // Fetch supported currencies
            const currencyResponse = await axios.get('https://api.coingecko.com/api/v3/simple/supported_vs_currencies');
            const supportedCurrencies = currencyResponse.data;
            console.log('Supported currencies:', supportedCurrencies);

            // Check if the coin and currency are supported
            if (!supportedCoins.includes(coin) || !supportedCurrencies.includes(currency)) {
                console.log(`Invalid coin or currency: coin - ${coin}, currency - ${currency}`);

                const supportedCoinsList = supportedCoins.slice(0, 50).join(', ');  // Limit to first 50 coins to avoid too long message
                const supportedCurrenciesList = supportedCurrencies.join(', ');

                const embed = new EmbedBuilder()
                    .setTitle('Invalid Coin or Currency Provided')
                    .setDescription('Please check your inputs.')
                    .addFields(
                        { name: 'Supported Coins (first 50)', value: supportedCoinsList },
                        { name: 'Supported Currencies', value: supportedCurrenciesList }
                    )
                    .setColor("#F71D0A")
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const { data } = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}`
            );

            console.log('API response data:', data);

            // Check if the coin and currency exist in the response
            if (!data[coin] || !data[coin][currency]) {
                console.log(`Invalid coin or currency: coin - ${coin}, currency - ${currency}`);
                return interaction.reply({ content: `Invalid coin or currency provided! Please check your inputs.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`💹・Crypto stats`)
                .setDescription(`The current price of **1 ${coin.toUpperCase()}** = **${data[coin][currency]} ${currency.toUpperCase()}**`)
                .setColor("#F71D0A")
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error fetching cryptocurrency data:', error);
            return interaction.reply({ content: "An error occurred while fetching the cryptocurrency data. Please try again later.", ephemeral: true });
        }
    }
};
