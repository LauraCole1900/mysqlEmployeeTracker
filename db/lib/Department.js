const connection = require("../connection.js");

class Department {
  constructor(connection) {
    this.connection = connection;
  };

  // Methods
}

//Export
module.exports = new Department(connection);