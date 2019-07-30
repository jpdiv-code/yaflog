'use strict';

const yaml = require('yaml');
const FLog = require('./FLog');

async function log(level, message, extra, color) {
    const consoleEnabled = this.options.enabled;
    if (!consoleEnabled && !this.flog) {
        return;
    }

    const t = new Date();
    const obj = {
        timestamp: t.getTime(),
        level,
        time: `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}:${t.getMilliseconds()}`,
        message,
    };
    if (extra) {
        obj.extra = extra;
    }

    if (consoleEnabled) {
        let text;
        if (this.options.beautify) {
            text = yaml.stringify(obj);
        } else {
            text = JSON.stringify(obj);
        }
        if (this.options.colorize) {
            console[level](color || '' + text + '\x1b[0m'); // reset color
        } else {
            console[level](text);
        }
    }

    if (this.flog) {
        await this.flog.log(obj);   
    }
}

module.exports = class YAFLog {
    /**
     * Create YAFLog instance.
     * @param {YAFLogOptions instance} yaflogOptions 
     */
    constructor(yaflogOptions) {
        this.options = yaflogOptions.console;
        this.flogOptions = yaflogOptions.flog;
        if (this.flogOptions.enabled) {
            this.flog = new FLog(this.flogOptions);
        }
    }

    /**
     * Loads logger
     */
    load() {
        if (this.loaded) {
            return this;
        }
        if (this.flog) {
            this.flog.load();
        }
        this.loaded = true;
        return this;
    }

    /**
     * Log with 'info' level
     * @param {Text message} message 
     * @param {Object with extra data} extra 
     */
    async info(message, extra) {
        await log.call(this, 'info', message, extra, '\x1b[32m');
    }

    /**
     * Log with 'warn' level
     * @param {Text message} message 
     * @param {Object with extra data} extra 
     */
    async warn(message, extra) {
        await log.call(this, 'warn', message, extra, '\x1b[33m');
    }

    /**
     * Log with 'error' level
     * @param {Text message} message 
     * @param {Object with extra data} extra 
     */
    async error(message, extra) {
        await log.call(this, 'error', message, extra, '\x1b[31m');
    }

    /**
     * Log with 'debug' level
     * @param {Text message} message 
     * @param {Object with extra data} extra 
     */
    async debug(message, extra) {
        if (this.options.debugOutput) {
            await log.call(this, 'debug', message, extra, '\x1b[36m');
        }
    }
    
    /**
     * If debugOutput is enabled, calls the passed function, waits for the end of execution and outputs the result to the logger
     * @param {Function (maybe async) that must return an object with signature { message?, extra? }} fn
     */
    async lazyDebug(fn) {
        if (this.options.debugOutput) {
            const result = await fn();
            const message = result.message;
            const extra = result.extra;
            await log.call(this, 'debug', message, extra, '\x1b[36m');
        }
    }
};