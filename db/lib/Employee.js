const connection = require("../connection.js");

class Employee {
  constructor(connection) {
    this.connection = connection;
  };

  // Methods
  viewAllEmployees() {
    return this.connection.query("SELECT * FROM employee")
  }

  addEmployee(data) {
    return this.connection.query("INSERT INTO employee SET ?", data)
  }
}

// Export
module.exports = new Employee(connection);