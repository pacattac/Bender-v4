import { ShardConnectionData } from "../data/gatewayTypes";
import ShardManager, { ShardMessage } from "../utils/shardManager";
import Bot from "./bot";

export default class Shard {
    bot: Bot;
    id!: number;
    total_shards!: number;

    constructor(bot: Bot, data: ShardConnectionData) {
        this.bot = bot;
        this.setShardData(data);
    }

    setShardData(data: ShardConnectionData) {
        this.id = data[0];
        this.total_shards = data[1];
    }

    processMessage(message: ShardMessage) {

    }

    handleMessage(message: string) {
        this.bot.logger.debug('SHARD MESSAGE', message);
        const parsedMessage = this.parseMessage(message);
        if (parsedMessage) {
            this.processMessage(parsedMessage);
        }
    }

    sendMessage(message: ShardMessage) {
        const stringifiedMessage = JSON.stringify(message);

    }

    parseMessage(message: string): ShardMessage | null {
        return ShardManager.parseMessage(message, this.bot.logger);
    }
}