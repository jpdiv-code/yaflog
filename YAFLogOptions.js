'use strict';

function merge(dist, src) {
    for (let key in src) {
        const distValue = dist[key];
        const srcValue = src[key];
        if (distValue) {
            if (typeof distValue === 'object') {
                if (Array.isArray(distValue)) {
                    if (Array.isArray(srcValue)) {
                        for (let value of srcValue) {
                            distValue.push(value);
                        }
                    } else {
                        dist[key] = srcValue;
                    }
                } else {
                    if (typeof srcValue === 'object') {
                        if (Array.isArray(srcValue)) {
                            dist[key] = srcValue;
                        } else {
                            merge(distValue, srcValue);
                        }
                    } else {
                        dist[key] = srcValue;
                    }
                }
            } else {
                dist[key] = srcValue;
            }
        } else {
            dist[key] = srcValue;
        }
    }
}

module.exports = class YAFLogOptions {
    constructor() {
        this.console = {
            enabled: true,
            debugOutput: true,
            beautify: true,
            colorize: true,
            colors: {
                info: '\x1b[32m',
                warn: '\x1b[33m',
                error: '\x1b[31m',
                debug: '\x1b[36m',
            },
        };
        this.flog = {
            enabled: true,
            debugOutput: true,
            dir: './logs',
            prefix: '',
            suffix: '',
            extension: '.log',
            capacity: 1024,
        };
    }
    
    setConsoleOptions(consoleOptions) {
        merge(this.console, consoleOptions);
        return this;
    }
    
    setFLogOptions(flogOptions) {
        merge(this.flog, flogOptions);
        return this;
    }
};