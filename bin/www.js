#!/usr/bin/env node

/**
 * Module dependencies.
 */
const app = require('../app');
const config = require('../src/config/cfg');
const startupMongo = require('../src/db/mongodb/index');

module.exports = (async () => {
    await startupMongo();

    /**
     * Get port from environment and store in Express.
     */
    app.set('port', config.port);

    app.listen(config.port);

    return app;
})();
