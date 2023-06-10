import { LOCALE_LIST, Locale, PermissionName, LocaleDict, UnixTimestampMillis, Timestamp, ReplaceMap, Snowflake } from '../types/types.js';
import languages, { LangKey } from '../text/languageList.js';
import Logger from '../structures/logger.js';
import { DEFAULT_LANGUAGE, EXIT_CODE_NO_RESTART } from '../data/constants.js';
import TimeUtils from './time.js';
import MiscUtils, { EmojiKey } from './misc.js';
import TextUtils from './text.js';
import Replacers from './replacers.js';

if (!languages[DEFAULT_LANGUAGE]) {
    console.error(`Default language invalid: No translation file exists for ${DEFAULT_LANGUAGE}!`);
    process.exit(EXIT_CODE_NO_RESTART);
}

export default class LanguageUtils {

    static discordSupportsLocale(locale: Locale): boolean {
        return LOCALE_LIST.includes(locale);
    }

    static _get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string | string[] {
        if (!this.discordSupportsLocale(locale)) {
            locale = DEFAULT_LANGUAGE;
        }
        // fallback to default if specified language's translation file doesn't exist
        // or if the key doesn't exist in that language's translation file
        return languages[locale]?.[key] || languages[DEFAULT_LANGUAGE]?.[key];
    }

    static get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result[0] || '';
        }
        return result || '';
    }

    static getArr(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string[] {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result;
        } else if (result) {
            return [result];
        }
        return [];
    }

    static getRandom(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return MiscUtils.randomItem(result);
        }
        return result || '';
    }

    static getAndReplace(key: LangKey, replaceMap: ReplaceMap, locale: Locale = DEFAULT_LANGUAGE): string {
        const text = LanguageUtils.get(key, locale);
        return Replacers.replace(text, replaceMap, locale);
    }

    static formatDateAgo(key: LangKey, timestamp: Timestamp | UnixTimestampMillis, locale?: Locale) {
        if (typeof timestamp === 'string') {
            timestamp = TimeUtils.parseTimestampMillis(timestamp);
        }
        const formattedDate = TimeUtils.formatDate(timestamp);
        const relativeDuration = TimeUtils.relative(timestamp);
        return LanguageUtils.getAndReplace(key, { dateRelative: `${formattedDate} (${relativeDuration})` }, locale);
    }

    static formatNumber(num: number, locale?: Locale) {
        return num.toLocaleString(locale);
    }

    static getLocalizationMap(key: LangKey, emojiKey?: EmojiKey) {
        const emoji = emojiKey ? MiscUtils.getDefaultEmoji(emojiKey) : null;
        const dict: LocaleDict = {
            [DEFAULT_LANGUAGE]: emojiKey ? `${emoji} ${LanguageUtils.get(key)}` : LanguageUtils.get(key)
        }
        for (const locale in languages) {
            const lang = languages[locale];
            if (lang && key in lang) {
                if (emojiKey) {
                    dict[locale as Locale] = `${emoji} ${lang[key]}`;
                } else {
                    dict[locale as Locale] = lang[key];
                }
            }
        }
        return dict;
    }

    static getCommandLink(langKeys: LangKey[], commandID: Snowflake) {
        // TODO: command links cannot be localized, see:
        // https://github.com/discord/discord-api-docs/issues/5518
        // for now this line will force the default language
        const cmdNames = langKeys.map(key => this.get(key));
        return TextUtils.mention.parseCommand(cmdNames.join(' '), commandID);
    }
    static getCommandText(langKeys: LangKey[], locale?: Locale) {
        // create a localized text version of a command link; used when a command isn't cached
        const cmdNames = langKeys.map(key => this.get(key, locale));
        return `\`/${cmdNames.join(' ')}\``;
    }

    static getPermissionName(perm: PermissionName, locale?: Locale) {
        return LanguageUtils.get(`PERMISSION_${perm}`, locale);
    }

    static logLocalizationSupport(logger: Logger) {
        const langList = Object.keys(languages);
        logger.debug('LANGUAGES', `Loaded ${langList.length} languages: ${langList.join(', ')}`);
        logger.debug('LANGUAGES', `Implementing ${langList.length}/${LOCALE_LIST.length} locales supported by Discord`);
        const defaultLangKeys = Object.keys(languages[DEFAULT_LANGUAGE]);
        for (const locale in languages) {
            if (!languages[locale]) {
                continue;
            }
            const keys = Object.keys(languages[locale]);
            if (keys.length < defaultLangKeys.length) {
                logger.moduleWarn('LANGUAGES', `Language '${locale}' is incomplete (${keys.length}/${defaultLangKeys.length} keys.)`);
            }
        }
    }
}
