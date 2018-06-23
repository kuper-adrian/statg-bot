const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const logger = require('./log').getLogger();
let knex = require('knex');

const DB_FILE_NAME = 'stat-g-db.db';

const TABLES = {
  registeredPlayer: 'registered_player',
  region: 'region',
  settings: 'settings',
  mode: 'mode',
};

exports.init = function init(dataFolderPath = './data') {
  return new Promise((resolve, reject) => {
    // make sure that data folder exists
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath);
    }

    const dbFilePath = `${dataFolderPath}/${DB_FILE_NAME}`;

    // create db file if it doesnt already exist
    if (fs.existsSync(dbFilePath)) {
      logger.info(`database at path "${dbFilePath}" already exists.`);
    } else {
      logger.info('creating database...');
      const db = new sqlite3.Database(dbFilePath);
      db.close();

      logger.info('creating database finished.');
    }

    /* eslint global-require: "off" */
    knex = require('knex')({
      client: 'sqlite3',
      connection: {
        filename: dbFilePath,
      },
      useNullAsDefault: true,
    });

    logger.info('making sure all tables are there');
    // create tables if they dont exist

    knex.schema.hasTable(TABLES.region)
      .then((exists) => {
        if (!exists) {
          logger.debug(`creating table "${TABLES.region}"`);

          return knex.schema.createTable(TABLES.region, (t) => {
            t.increments('id').primary();
            t.text('region_name');
            t.integer('is_global_region');
          });
        }
        logger.debug(`"${TABLES.region}" already exists`);
        return Promise.resolve(false);
      })

      .then((created) => {
        if (created === false) {
          return Promise.resolve();
        }

        logger.info(`Table "${TABLES.region}" created!`);
        logger.debug(`adding default values to table "${TABLES.region}"`);

        return knex(TABLES.region).insert([
          { region_name: 'pc-na', is_global_region: 0 },
          { region_name: 'pc-eu', is_global_region: 1 },
          { region_name: 'pc-ru', is_global_region: 0 },
          { region_name: 'pc-oc', is_global_region: 0 },
          { region_name: 'pc-kakao', is_global_region: 0 },
          { region_name: 'pc-sea', is_global_region: 0 },
          { region_name: 'pc-sa', is_global_region: 0 },
          { region_name: 'pc-as', is_global_region: 0 },
          { region_name: 'pc-jp', is_global_region: 0 },
          { region_name: 'pc-krjp', is_global_region: 0 },
          { region_name: 'xbox-as', is_global_region: 0 },
          { region_name: 'xbox-eu', is_global_region: 0 },
          { region_name: 'xbox-na', is_global_region: 0 },
          { region_name: 'xbox-oc', is_global_region: 0 },
        ]);
      })

      .then(() => knex.schema.hasTable(TABLES.registeredPlayer))

      .then((exists) => {
        if (!exists) {
          logger.debug(`creating table "${TABLES.registeredPlayer}"`);

          return knex.schema.createTable(TABLES.registeredPlayer, (t) => {
            t.increments('id').primary();
            t.text('discord_id');
            t.text('discord_name');
            t.text('pubg_id');
            t.text('pubg_name');
            t.integer('region_id');
            t.foreign('region_id').references('id').inTable(TABLES.region);
          });
        }

        logger.debug(`"${TABLES.registeredPlayer}" already exists`);
        return Promise.resolve(false);
      })

      .then((created) => {
        if (created !== false) {
          logger.info(`Table "${TABLES.registeredPlayer}" created!`);
        }
        return knex.schema.hasTable(TABLES.mode);
      })

      .then((exists) => {
        if (!exists) {
          logger.debug(`creating table "${TABLES.mode}"`);
          return knex.schema.createTable(TABLES.mode, (t) => {
            t.increments('id').primary();
            t.text('mode_name');
          });
        }
        logger.debug(`"${TABLES.mode}" already exists`);
        return Promise.resolve(false);
      })

      .then((created) => {
        if (created === false) {
          return Promise.resolve();
        }

        logger.info(`Table "${TABLES.mode}" created!`);
        logger.debug(`adding values to table "${TABLES.mode}"`);

        return knex(TABLES.mode).insert([
          { mode_name: 'default' },
          { mode_name: 'immediate' },
        ]);
      })

      .then(() => knex.schema.hasTable(TABLES.settings))

      .then((exists) => {
        if (!exists) {
          logger.debug(`creating table "${TABLES.settings}"`);
          return knex.schema.createTable(TABLES.settings, (t) => {
            t.increments('id').primary();
            t.integer('mode_id');
            t.foreign('mode_id').references('id').inTable(TABLES.mode);
          });
        }
        logger.debug(`"${TABLES.settings}" already exists`);
        return Promise.resolve(false);
      })

      .then((created) => {
        if (created === false) {
          return Promise.resolve();
        }

        logger.info(`Table "${TABLES.settings}" created!`);
        logger.debug(`adding values to table "${TABLES.settings}"`);
        return knex(TABLES.settings).insert([
          { mode_id: 0 },
        ]);
      })

      .then(() => {
        logger.info('Database initialization finished!');
        resolve();
      })

      .catch((error) => {
        logger.error(error.message);
        reject(error);
      });
  });
};

exports.getRegisteredPlayers = function getRegisteredPlayers(where) {
  return knex
    .select()
    .from(TABLES.registeredPlayer)
    .where(where);
};

exports.insertRegisteredPlayer = function insertRegisteredPlayer(player) {
  return knex(TABLES.registeredPlayer).insert(player);
};

exports.deleteRegisteredPlayers = function deleteRegisteredPlayers(where) {
  return knex(TABLES.registeredPlayer)
    .where(where)
    .del();
};

exports.getRegions = function getRegions(where) {
  return knex
    .select()
    .from(TABLES.region)
    .where(where);
};

exports.setGlobalRegion = function setGlobalRegion(newRegionName) {
  // use transaction to prevent faulty database state (e.g. no global region)
  return knex.transaction(trx => knex(TABLES.region)
    // first set current global region off
    .transacting(trx)
    .update({ is_global_region: false })
    .where({ is_global_region: true })

    // set new global region
    .then(() => knex(TABLES.region)
      .transacting(trx)
      .update({ is_global_region: true })
      .where({ region_name: newRegionName }))

    .then(trx.commit)
    .catch(trx.rollback));
};
