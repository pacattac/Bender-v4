import { EventHandler } from '../data/types';
import { ChannelPinsUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ChannelPinsUpdateHandler extends EventHandler<ChannelPinsUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: ChannelPinsUpdateData*/) => {
        // event unused for now
    }
}