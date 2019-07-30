'use strict';

const helper = new (require('jhelp'))();

module.exports = class YAFLogOptions {
    /**
     * Create YAFLogOptions instance.
     */
    constructor() {
        this.console = {
            enabled: true,
            debugOutput: true,
            beautify: true,
            colorize: true,
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
    
    /**
     * Sets console logger options
     * @param {Console logger options} consoleOptions 
     */
    setConsoleOptions(consoleOptions) {
        helper.merge(this.console, consoleOptions);
        return this;
    }

    /**
     * Sets file-logger options
     * @param {File-logger options} flogOptions 
     */
    setFLogOptions(flogOptions) {
        helper.merge(this.flog, flogOptions);
        return this;
    }
};