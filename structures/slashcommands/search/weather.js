const { CommandInteraction, Client, ApplicationCommandOptionType } = require('discord.js');
const weather = require('weather-js');

module.exports = {
    name: 'weather',
    description: 'Get the weather forecast for a location',
    options: [
        {
            name: 'location',
            description: 'Location to get the weather forecast for',
            type: 3,
            required: true,
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const country = interaction.options.getString('location');

        weather.find({ search: country, degreeType: 'C' }, function (error, result) {
            if (error) {
                console.log(error); // Log any errors from weather-js
                return interaction.reply({ content: 'Something went wrong while fetching the weather.', ephemeral: true });
            }

            if (!result || result.length === 0) {
                return interaction.reply({ content: '**Invalid** location', ephemeral: true });
            }

            const current = result[0].current;
            const location = result[0].location;

            const embed = {
                title: `☀️ Weather - ${current.skytext}`,
                description: `Weather forecast for ${current.observationpoint}`,
                thumbnail: {
                    url: current.imageUrl,
                },
                fields: [
                    {
                        name: "Timezone",
                        value: `UTC${location.timezone}`,
                        inline: true,
                    },
                    {
                        name: "Degree Type",
                        value: `Celsius`,
                        inline: true,
                    },
                    {
                        name: "Temperature",
                        value: `${current.temperature}°`,
                        inline: true,
                    },
                    {
                        name: "Wind",
                        value: `${current.winddisplay}`,
                        inline: true,
                    },
                    {
                        name: "Feels like",
                        value: `${current.feelslike}°`,
                        inline: true,
                    },
                    {
                        name: "Humidity",
                        value: `${current.humidity}%`,
                        inline: true,
                    }
                ],
            };

            interaction.reply({ embeds: [embed], ephemeral: false });
        });
    },
};
