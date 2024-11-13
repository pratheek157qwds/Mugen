const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'tictactoe',
    description: 'Challenge another user to a game of Tic-Tac-Toe',
    options: [{
        name: 'opponent',
        description: 'The user you want to challenge',
        type: 6, // USER option type
        required: true
    }],
    run: async (client, interaction) => {
        const opponent = interaction.options.getUser('opponent');
        if (opponent.bot) return interaction.reply({ content: "You can't challenge a bot!", ephemeral: true });
        if (opponent.id === interaction.user.id) return interaction.reply({ content: "You can't challenge yourself!", ephemeral: true });

        const challengeEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Tic-Tac-Toe Challenge')
            .setDescription(`${interaction.user} has challenged you to a game of Tic-Tac-Toe, ${opponent}!`);
        const challengeButtons = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('reject').setLabel('Reject').setStyle(ButtonStyle.Danger).setEmoji('❌')
            ]);
        const challengeMessage = await interaction.reply({ embeds: [challengeEmbed], components: [challengeButtons], fetchReply: true });

        let gameCollector;
        const challengeCollector = challengeMessage.createMessageComponentCollector({ filter: (i) => ['accept', 'reject'].includes(i.customId) && i.user.id === opponent.id, time: 60000000 });

        challengeCollector.on('collect', async (i) => {
            if (i.customId === 'reject') {
                return i.update({ content: `${opponent} has declined the challenge.`, embeds: [], components: [] });
            }

            let board = Array.from({ length: 3 }, () => Array(3).fill(' '));
            let currentPlayer = interaction.user;
            let gameOver = false;

            const createGameButtons = () => board.map((row, r) =>
                new ActionRowBuilder().addComponents(row.map((col, c) =>
                    new ButtonBuilder()
                        .setCustomId(`${r}-${c}`)
                        .setLabel(col === ' ' ? '\u200b' : col)
                        .setStyle(col === '❌' ? ButtonStyle.Danger : col === '⭕' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setDisabled(col !== ' ')
                ))
            );
            
            let gameButtons = createGameButtons();
            const gameMessage = await i.update({ content: `${currentPlayer}'s Turn!`, components: gameButtons });

            gameCollector = gameMessage.createMessageComponentCollector({ componentType: 2 }); 
            gameCollector.on('collect', async (btn) => {
                if (btn.user.id !== currentPlayer.id || gameOver) return;

                const [row, col] = btn.customId.split('-').map(Number);
                board[row][col] = currentPlayer.id === interaction.user.id ? '❌' : '⭕';

                if (checkWin(board, currentPlayer.id === interaction.user.id ? '❌' : '⭕')) {
                    gameOver = true;
                    await btn.update({ content: `🎉 ${currentPlayer} wins! 🎉`, components: createGameButtons(board) }); // Disable all buttons
                } else if (checkTie(board)) {
                    gameOver = true;
                    await btn.update({ content: "It's a tie! 🤝", components: createGameButtons(board) });
                } else {
                    currentPlayer = currentPlayer === interaction.user ? opponent : interaction.user;
                    await btn.update({ content: `${currentPlayer}'s Turn!`, components: createGameButtons(board) });
                }
            });

            gameCollector.on('end', (collected, reason) => {
                if (reason === 'time' && !gameOver) {
                    btn.message.edit({ content: 'Game timed out.', embeds: [], components: [] });
                }

                // Stop the timeout if the game is over
                challengeCollector.stop();
            }); 
        });

        challengeCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: 'Challenge timed out.', embeds: [], components: [] });
            } else if (!collected.size) {
                interaction.editReply({ content: 'The challenge was not accepted or rejected.', embeds: [], components: [] });
            }
        });
    }
};

function checkWin(board, playerSymbol) {
    for (let i = 0; i < 3; i++) {
        if (
            (board[i][0] === playerSymbol && board[i][1] === playerSymbol && board[i][2] === playerSymbol) ||
            (board[0][i] === playerSymbol && board[1][i] === playerSymbol && board[2][i] === playerSymbol)
        ) {
            return true;
        }
    }
    return (
        (board[0][0] === playerSymbol && board[1][1] === playerSymbol && board[2][2] === playerSymbol) ||
        (board[0][2] === playerSymbol && board[1][1] === playerSymbol && board[2][0] === playerSymbol)
    );
}

function checkTie(board) {
    return board.every(row => row.every(cell => cell !== ' '));
}
