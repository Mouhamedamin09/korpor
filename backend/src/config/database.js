/**
 * This file adapts the existing db.config.js to the interface expected by the property service
 */
const { sequelize, ormQuery } = require("./db.config");

// Export sequelize query interface for use in property service
// with the same interface that property service expects
module.exports = {
  query: async (sql, params) => {
    const [results] = await ormQuery(sql, {
      replacements: params,
    });
    return [results];
  },
  getConnection: async () => {
    // Create a connection object with transaction methods
    const connection = {
      transaction: null, // Will store the transaction object

      beginTransaction: async () => {
        // Start a transaction
        connection.transaction = await sequelize.transaction();
      },

      query: async (sql, params) => {
        // Execute query within the transaction
        const [results] = await sequelize.query(sql, {
          replacements: params,
          transaction: connection.transaction,
        });
        return [results];
      },

      commit: async () => {
        // Commit the transaction
        await connection.transaction.commit();
      },

      rollback: async () => {
        // Rollback the transaction
        await connection.transaction.rollback();
      },

      release: () => {
        //to ghassen(hethi taamel release lel connection) fer8a 5ater sequilaze manage its own connection pool
      },
    };

    return connection;
  },
};
