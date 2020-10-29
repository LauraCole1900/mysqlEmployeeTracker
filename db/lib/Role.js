const connection = require("../connection.js");

class Role {
  constructor(connection) {
    this.connection = connection;
  };

  // Methods
};

// Export
module.exports = new Role(connection);