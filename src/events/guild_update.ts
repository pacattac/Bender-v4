import { EventHandler } from '../data/types';
import { GuildUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildUpdateHandler extends EventHandler<GuildUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildUpdateData) => {
        this.bot.cache.guilds.update(eventData);
    }

    handler = (/*eventData: GuildUpdateData*/) => {
        // event unused for now
    }
}