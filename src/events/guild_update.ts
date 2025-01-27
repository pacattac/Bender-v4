import { EventHandler } from '../types/types.js';
import type { GuildUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class GuildUpdateHandler extends EventHandler<GuildUpdateData> {
    constructor(bot: Bot) {
        super('guild_update', bot);
    }

    cacheHandler = (eventData: GuildUpdateData) => {
        this.bot.cache.guilds.update(eventData);
    }

    handler = (/*eventData: GuildUpdateData*/) => {
        // event unused for now
    }
}