import { INTERACTION_RESPONSE_TIMEOUT } from '../data/constants.js';
import type Bot from '../structures/bot.js';
import type { Interaction, Snowflake } from '../types/types.js';
import type { BlackjackInteraction } from './blackjack.js';
import BlackjackUtils from './blackjack.js';
import type { RockPaperScissorsInteraction } from './rps.js';
import RPSUtils from './rps.js';
import type { TicTacToeInteraction } from './tictactoe.js';
import TicTacToeUtils from './tictactoe.js';
import type { RestrictEmojiInteraction } from './restrictEmoji.js';
import RestrictEmojiUtils from './restrictEmoji.js';
import type { InactiveStatsInteraction } from './inactiveStats.js';
import InactiveStatsUtils from './inactiveStats.js';

export type PendingInteractionBase = {
    author: Snowflake,
    interaction: Interaction,
    expireTimeout?: NodeJS.Timeout
}
export type PendingInteraction = TicTacToeInteraction | RockPaperScissorsInteraction | BlackjackInteraction | RestrictEmojiInteraction | InactiveStatsInteraction;

export default class PendingInteractionUtils {
    bot: Bot;
    pendingInteractions: Record<Snowflake, PendingInteraction>;
    tttUtils: TicTacToeUtils;
    rpsUtils: RPSUtils;
    bjUtils: BlackjackUtils;
    remUtils: RestrictEmojiUtils;
    inactiveUtils: InactiveStatsUtils;

    constructor(bot: Bot) {
        this.bot = bot;
        this.pendingInteractions = {};
        this.tttUtils = new TicTacToeUtils(bot);
        this.rpsUtils = new RPSUtils(bot);
        this.bjUtils = new BlackjackUtils(bot);
        this.remUtils = new RestrictEmojiUtils(bot);
        this.inactiveUtils = new InactiveStatsUtils(bot);
    }

    addItem(interactionData: PendingInteraction) {
        const id = interactionData.interaction.id;
        if (!id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without id:', interactionData.interaction);
            return;
        }
        interactionData.expireTimeout = setTimeout(() => this.deleteItem(id), INTERACTION_RESPONSE_TIMEOUT);
        this.pendingInteractions[id] = interactionData;
    }

    deleteItem(id: Snowflake) {
        delete this.pendingInteractions[id];
    }

    async processInteraction(interaction: Interaction) {
        if (!interaction.message?.id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without message:', interaction);
            return;
        }
        if (!interaction.data?.custom_id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without custom ID:', interaction);
            return;
        }
        const idPieces = interaction.data.custom_id.split('_');
        const initialInteractionID = idPieces[1];
        if (!initialInteractionID) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Interaction has invalid custom ID:', interaction.data.custom_id);
            return;
        }
        const interactionData = this.pendingInteractions[initialInteractionID as Snowflake];
        if (!interactionData) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Interaction doesn\'t correspond to pending interaction object:', interaction, this.pendingInteractions);
            return;
        }
        switch (idPieces[0]) {
            case 'ttt':
                return this.tttUtils.processPlayerMove(interactionData as TicTacToeInteraction, interaction);
            case 'rps':
                return this.rpsUtils.processPlayerChoice(interactionData as RockPaperScissorsInteraction, interaction);
            case 'bj':
                return this.bjUtils.processPlayerAction(interactionData as BlackjackInteraction, interaction);
            case 'rem':
                return this.remUtils.submitRoles(interactionData as RestrictEmojiInteraction, interaction);
            case 'inactive':
                return this.inactiveUtils.submitRoles(interactionData as InactiveStatsInteraction, interaction);
        }
    }
}