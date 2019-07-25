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
            console[level](color + text + '\x1b[0m'); // reset color
        } else {
            console[level](text);
        }
    }

    if (this.flog) {
        await this.flog.log(obj);   
    }
}

module.exports = class YAFLog {
    constructor(yaflogOptions) {
        this.options = yaflogOptions.console;
        const flogOptions = yaflogOptions.flog;
        if (flogOptions.enabled) {
            this.flog = new FLog(flogOptions);
        }
    }

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

    async info(message, extra) {
        await log.call(this, 'info', message, extra, this.options.colors.info);
    }
    
    async warn(message, extra) {
        await log.call(this, 'warn', message, extra, this.options.colors.warn);
    }
    
    async error(message, extra) {
        await log.call(this, 'error', message, extra, this.options.colors.error);
    }
    
    async debug(message, extra) {
        if (this.options.debugOutput) {
            await log.call(this, 'debug', message, extra, this.options.colors.debug);
        }
    }
    
    async lazyDebug(fn) {
        if (this.options.debugOutput) {
            const { message, extra } = await fn();
            await log.call(this, 'debug', message, extra, this.options.colors.debug);
        }
    }
};