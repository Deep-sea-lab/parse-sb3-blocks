import { default as allBlocks, allMenus } from './all-blocks.js';
import translations from './translations.js';
import localeOptions from './options.js';
import { specialMessageMap } from './special-messages.js';
import Sanitizer from '../sanitizer.js';

const _translationKeyToOpcode = {};
Object.keys(allBlocks).forEach(opcode => {
    const entry = allBlocks[opcode];
    if (entry.noTranslation) return;
    const translationKey = entry.translationKey || opcode.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(_translationKeyToOpcode, translationKey)) return;
    _translationKeyToOpcode[translationKey] = opcode;
});

const getOpcodeFromTranslationKey = translationKey => _translationKeyToOpcode[translationKey];

const getTranslationKeyFromValue = (locale, value) => {
    const localeTranslation = translations[locale];
    let candidates = [];
    if (localeTranslation) {
        candidates = Object.keys(localeTranslation).filter(key => localeTranslation[key] === value);
    } else {
        candidates = Object.values(allBlocks).filter(item => item.defaultMessage === value);
    }
    return candidates.length ? candidates[0] : null;
};

const getMessageForLocale = (locale, opcode, inputtables) => {
    const blockInfo = allBlocks[opcode];
    if (!blockInfo) {
        // Unknown opcode: build a template from inputtables if available
        if (inputtables && Object.keys(inputtables).length > 0) {
            const keys = Object.keys(inputtables);
            const parts = keys.map(key => `{${key}}`);
            return Sanitizer.labelSanitize(opcode + ' ' + parts.join(' '));
        }
        // Unknown opcode with no inputs: return the opcode itself as the message
        return Sanitizer.labelSanitize(opcode);
    }
    const translationKey = blockInfo.translationKey || opcode.toUpperCase();
    if (translations[locale] && translations[locale][translationKey]) {
        return Sanitizer.labelSanitize(translations[locale][translationKey]);
    }
    return Sanitizer.labelSanitize(blockInfo.defaultMessage);
};

const getOptsForLocale = (locale, opcode) => {
    const blockInfo = allBlocks[opcode];
    if (!blockInfo) {
        // Unknown opcode: return empty options
        return {};
    }
    const translationKey = blockInfo.translationKey || opcode.toUpperCase();
    if (translations[locale] && translations[locale][translationKey]) {
        if (localeOptions[locale] && localeOptions[locale][translationKey]) {
            return {
                category: localeOptions[locale][translationKey],
            };
        }
        return {};
    }
    return blockInfo.defaultOptions || {};
};

const getSpecialMessage = (locale, key) => {
    if (Object.prototype.hasOwnProperty.call(specialMessageMap, key))
        return getMessageForLocale(locale, specialMessageMap[key]);
};

const isSpecialMenuValue = (opcode, value) =>
    Object.prototype.hasOwnProperty.call(allMenus[opcode] || {}, value);

const getMenuItemForLocale = (locale, opcode, value) => {
    const translationKey = allMenus[opcode][value].translationKey;
    if (translations[locale] && translations[locale][translationKey]) {
        return Sanitizer.sanitize(translations[locale][translationKey]);
    }
    return Sanitizer.sanitize(allMenus[opcode][value].defaultMessage);
};

export {
    getMessageForLocale,
    getOptsForLocale,
    getSpecialMessage,
    isSpecialMenuValue,
    getMenuItemForLocale,
    getOpcodeFromTranslationKey,
    getTranslationKeyFromValue,
};
