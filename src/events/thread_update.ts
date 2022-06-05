import { EventHandler } from '../data/types';
import { ThreadUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ThreadUpdateHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.set(eventData);
    }

    handler = (/*eventData: ThreadUpdateData*/) => {
        // event unused for now
    }
}