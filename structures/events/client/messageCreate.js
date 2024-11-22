const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client_prefix, developers } = require('../../configuration/index');
const { logger } = require('../../functions/logger');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const fetch = require('node-fetch');
const client = require('../../client');

const specifiedUserId = '744557711513092098';

client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot || !message.guild) {
            return;
        }

        const afkStatus = await db.get(`afk_${message.author.id}`);
        if (afkStatus) {
            await db.delete(`afk_${message.author.id}`);
            await message.reply(`Welcome back, <@${message.author.id}>! Your AFK status has been removed.`);
        }

        if (message.mentions.has(client.user) && !message.mentions.everyone) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Hello!')
                .setDescription(`I am an all-in-one bot with multiple slash commands and prefix commands. My prefix is \`${client_prefix}\` Use \`${client_prefix}help\` to know more!`)
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: 'Support Server', value: '[Join our support server](https://discord.gg/ZQenq3C5)' },
                    { name: 'Invite Me', value: '[Invite the bot](https://discord.com/oauth2/authorize?client_id=1245320259217522758&permissions=8&integration_type=0&scope=bot)' }
                )
                .setImage('https://cdn.discordapp.com/attachments/1179508209321512990/1261288537785897117/standard.gif?ex=669269fd&is=6691187d&hm=bae15f8bcb412bcb0b6e8ae40ea15d242c7b82ea1f5686c1772c37d2ccc1f5b4&') // Replace with your GIF URL
                .setFooter({ text: 'Thank you for using our bot!', iconURL: 'https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.gg/CjhhBWUXz5'),
                    new ButtonBuilder()
                        .setLabel('Invite Me')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.com/oauth2/authorize?client_id=1245320259217522758&permissions=8&integration_type=0&scope=bot'),
                    new ButtonBuilder()
                    	.setLabel('Lord Host')
                    	.setStyle(ButtonStyle.Link)
                    	.setURL('https://discord.gg/lordcloud')
                );

            return message.channel.send({ embeds: [embed], components: [row] });
        }

        if (message.mentions.users.size > 0) {
            for (const [userId, user] of message.mentions.users) {
                const afkStatus = await db.get(`afk_${userId}`);
                if (afkStatus) {
                    await message.reply(`<@${userId}> is AFK: ${afkStatus}`);
                }
            }
        }

        const guildId = message.guild.id;
        const keys = await db.all();
        const guildKeys = keys.filter(key => key.id.startsWith(`autoresponder_${guildId}_`));
        for (const key of guildKeys) {
            const trigger = key.id.split(`autoresponder_${guildId}_`)[1].toLowerCase();

            if (message.content.trim().toLowerCase() === trigger) {
                const { response, attachment } = key.value;
                
                if (response && attachment) {
                    return message.reply({ content: response, files: [{ attachment }] });
                } else if (response) {
                    return message.reply({ content: response });
                } else if (attachment) {
                    return message.reply({ files: [{ attachment }] });
                }
            }
        }

        if (!message.content.startsWith(client_prefix)) {
            return;
        }

        const args = message.content.slice(client_prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (cmd.length === 0) return;

        let command = client.commands.get(cmd);

        if (!command) command = client.commands.get(client.aliases.get(cmd));

        if (command) {
            if (command.developerOnly) {
                if (!developers.includes(message.author.id)) {
                    return message.channel.send(`:x: ${command.name} is a developer-only command`);
                }
            }

            if (command.userPermissions) {
                if (!message.channel.permissionsFor(message.member).has(PermissionsBitField.resolve(command.userPermissions || []))) {
                    return message.channel.send(`You do not have the required permissions to use this command. You need the following permissions: ${command.userPermissions.join(", ")}`);
                }
            }

            if (command.clientPermissions) {
                if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.resolve(command.clientPermissions || []))) {
                    return message.channel.send(`I do not have the required permissions to use this command. I need the following permissions: ${command.clientPermissions.join(", ")}`);
                }
            }

            if (command.guildOnly && !message.guildId) {
                return message.channel.send(`${command.name} is a guild-only command`);
            }

            if (command) command.run(client, message, args);
        }
    } catch (err) {
        logger('An error occurred while executing the messageCreate event:', 'error');
        console.log(err);

        return message.channel.send(`An error occurred while executing the messageCreate event:\n${err}`);
    }
});
const updateMinecraftStatus = async () => {
    try {
        const guilds = client.guilds.cache;

        guilds.forEach(async (guild) => {
            const guildId = guild.id;
            const serverStatusData = await db.get(`minecraft_status_${guildId}`);

            if (serverStatusData) {
                const statusChannel = guild.channels.cache.get(serverStatusData.status_channel_id);

                if (!statusChannel) {
                    console.error(`Status channel not found for guild ${guildId}`);
                    return;
                }

                try {
                    const statusMessage = await statusChannel.messages.fetch(serverStatusData.status_message_id);

                    const updateStatus = async () => {
                        try {
                            const response = await fetch(`https://api.mcsrvstat.us/2/${serverStatusData.server_ip}:${serverStatusData.server_port}`);
                            const serverInfo = await response.json();

                            const isOnline = serverInfo.online;
                            const onlinePlayers = serverInfo.players?.online || 0;
                            const maxPlayers = serverInfo.players?.max || "?";
                            const playersList = serverInfo.players?.list?.join(", ") || "No players online (players names will not be shown in proxy servers).";
                            const version = serverInfo.version;

                            let status = isOnline ? `🟢 **Online** - ${onlinePlayers}/${maxPlayers} players` : '🔴 **Offline**';

                            const embed = new EmbedBuilder()
                                .setColor(isOnline ? '#00FF00' : '#FF0000')
                                .setTitle('Minecraft Server Status')
                                .setDescription(status)
                                .addFields(
                                    { name: 'Java IP:', value: serverStatusData.java_ip },
                                    { name: 'PE IP:', value: serverStatusData.pe_ip },
                                    { name: 'Port:', value: serverStatusData.server_port.toString() },
                                    { name: 'Version:', value: version },
                                    { name: 'Players:', value: playersList }
                                )
                                .setFooter({ text: 'Server status updates every 5 minutes.' })
                                .setTimestamp();

                            await statusMessage.edit({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Failed to fetch server status for guild ${guildId}:`, error);
                        }
                    };

                    updateStatus();
                    setInterval(updateStatus, 300000);

                } catch (fetchError) {
                    console.error(`Failed to fetch or update status message for guild ${guildId}:`, fetchError);
                }
            }
        });
    } catch (error) {
        console.error('An error occurred while updating Minecraft server statuses:', error);
    }
};

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await updateMinecraftStatus();
});
client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot || !message.guild) return;

        const bannedWords = (await db.get(`banned_words_${message.guild.id}`)) || [];
        const messageContent = message.content.toLowerCase();

        for (const word of bannedWords) {
            if (messageContent.includes(word)) {
                await message.delete();

                const censoredMessage = messageContent.replace(new RegExp(word, 'gi'), '``Blacklisted word censored``');

                const webhook = await message.channel.createWebhook({
                    name: message.author.username,
                    avatar: message.author.displayAvatarURL({ dynamic: true }),
                });

                await webhook.send({
                    content: censoredMessage,
                    username: message.author.username,
                    avatarURL: message.author.displayAvatarURL({ dynamic: true }),
                    allowedMentions: { parse: [] },
                });

                await webhook.delete();

                break;
            }
        }
    } catch (err) {
        console.error('An error occurred while processing a message:', err);
    }
});
