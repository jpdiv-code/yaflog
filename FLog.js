'use strict';

const path = require('path');
const fs = require('fs');
const { existsSync } = require('fs');

module.exports = class FLog {
    constructor(options) {
        this.options = options;
    }

    load() {
        if (this.loaded) {
            return this;
        }
        this.reset();
        this.setupExitHooks();
        this.loaded = true;
        return this;
    }

    reset() {
        const t = new Date();
        this.fname = `${this.options.prefix}${t.getFullYear()}-${t.getMonth()}-${t.getDay()}_${t.getHours()}.${t.getMinutes()}.${t.getSeconds()}.${t.getMilliseconds()}${this.options.suffix}${this.options.extension}`;
        this.logs = [];
        this.capacity = this.options.capacity;
    }

    setupExitHooks() {
        process.on('exit', this.exitHook.bind(this, 'exit'));
        process.on('SIGINT', this.exitHook.bind(this, 'SIGINT'));
        process.on('SIGUSR1', this.exitHook.bind(this, 'SIGUSR1'));
        process.on('SIGUSR2', this.exitHook.bind(this, 'SIGUSR2'));
        process.on('uncaughtException', err => this.exitHook.bind(this, 'uncaughtException', err));
    }

    async log(obj) {
        this.logs.push(obj);
        if (this.logs.length >= this.fileCapacity) {
            if (await this.save()) {
                this.reset();
                return true;
            }
        }
        return false;
    }

    logSync(obj) {
        this.logs.push(obj);
        if (this.logs.length >= this.fileCapacity) {
            if (this.saveSync()) {
                this.reset();
                return true;
            }
        }
        return false;
    }

    async save() {
        try {
            await this.createDir();
            const fname = this.dir + '/' + this.fname;
            const text = this.logs.map(log => JSON.stringify(log)).join('\n');
            await fs.promises.writeFile(fname, text);
        } catch (err) {
            console.error('LOGGER: FILE LOGGER: ERROR SAVING LOGS: ' + err);
            return false;
        }
        return true;
    }

    saveSync() {
        try {
            this.createDirSync();
            const fname = this.dir + '/' + this.fname;
            const text = this.logs.map(log => JSON.stringify(log)).join('\n');
            fs.writeFileSync(fname, text);
        } catch (err) {
            console.error('LOGGER: FILE LOGGER: ERROR SAVING LOGS: ' + err);
            return false;
        }
        return true;
    }

    async createDir() {
        this.dir = path.resolve(this.options.dir + '/');
        if (!existsSync(this.dir)) {
            await fs.promises.mkdir(this.dir);
        }
    }

    createDirSync() {
        this.dir = path.resolve(this.options.dir + '/');
        if (!existsSync(this.dir)) {
            fs.mkdirSync(this.dir);
        }
    }

    exitHook(cause, err) {
        if (this.dead) {
            return;
        }
        this.dead = true;
        const obj = { message: `Exit. Cause: ${cause}${err ? `\nUNCAUHHT EXCEPTION: ${err}` : ''}` };
        if (!this.logSync(obj)) {
            this.saveSync();
        }
        console.info(obj);
        process.exit();
    }
};