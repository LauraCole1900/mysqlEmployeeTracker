// classes & methods here

const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const Department = require("./lib/Department");
const Employee = require("./lib/Employee");
const Role = require("./lib/Role");


// table columns:
// Department: id, name
// Role: id, title, salary, department_id
// Employee: id, first_name, last_name, role_id, manager_id

// Department questions: What is the name of this department?

// Role questions: What is this role's title? What is this role's salary? In which department is this role? <- Dynamically populate the list from department table?

// Employee questions: What is the employee's first name? What is the employee's last name? What is the employee's job title (dynamically-populated list from role table?)? Who is the employee's manager?


// Opening question: What would you like to do? Choices: [Add department, Add employee, Add role, Delete department*, Delete employee*, Delete role*, Update employee's manager*, Update employee's role, View all employees, View employees by department, View employees by role, View employees by manager*, View department budget*]

// If add department, ask department question, INSERT INTO department table
// If add employee, ask employee questions, INSERT INTO employee table
// If add role, ask role questions, INSERT INTO role table

// If delete department, ask department question, delete from department table (& role table)
// If delete employee, ask employee question, delete from employee table
// If delete role, ask role questions, delete from role table (& employee table)

// If update employee's manager, ask employee questions, update employee table
// If update employee's role, ask employee questions, update employee table

// If view all employees, ?????
// If view employees by department, INNER JOIN employee & department tables, ?????
// If view employees by role, INNER JOIN employee & role tables, ?????
// If view employees by manager, ?????
// If view department budget, INNER JOIN employee, role & department tables, add all resulting role.salary and present total:
// Employee INNER JOIN role on role id for how many employees in a given role
// Role INNER JOIN department on department id for how many roles in that department


const departmentArray = [];

const roleArray = [];


const deptQuestion =
{
  type: "input",
  message: "Name of department?",
  name: "deptName"
};


const roleQuestions = [
  {
    type: "input",
    message: "Name of role?",
    name: "roleTitle"
  },
  {
    type: "number",
    message: "What is this role's salary?",
    name: "roleSalary"
  },
  {
    type: "checkbox",
    message: "In which department is this role?",
    name: "roleDept",
    choices: departmentArray
  },
]


const employeeQuestions = [
  {
    type: "input",
    message: "What is the employee's first name?",
    name: "firstName"
  },
  {
    type: "input",
    message: "What is the employee's last name?",
    name: "lastName"
  },
  {
    type: "checkbox",
    message: "What is the employee's job title?",
    name: "jobTitle",
    choices: roleArray
  },
  {
    type: "input",
    message: "Who is the employee's manager?",
    name: "managerName"
  },
]



// ==========================================================

// "Add" functions
function addDepartment() {
  inquirer.prompt(deptQuestion).then(response => {
    const newDepartment = new Department(response.deptName)
    console.log(newDepartment);
    console.log("Creating a new department...\n");
    var query = connection.query(
      "INSERT INTO department SET ?",
      {
        name: response.deptName
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " department added!\n");
        // Call updateProduct AFTER the INSERT completes
        // updateDepartment();
      }
    );
  })
};



function addEmployee() {
  inquirer.prompt(employeeQuestions).then(response => {
    const newEmployee = new Employee(response.firstName, response.lastName, response.jobTitle, response.managerName)
    console.log(newEmployee);
    console.log("Creating a new department...\n");
    var query = connection.query(
      "INSERT INTO employee SET ?",
      {
        first_name: response.firstName,
        last_name: response.lastName,
        role_id: response.jobTitle,
        manager_id: response.managerName
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee added!\n");
        // Call updateProduct AFTER the INSERT completes
        // updateEmployee();
      })
  })
};


function addRole() {
  inquirer.prompt(roleQuestions).then(response => {
    const newRole = new Role(response.roleTitle, response.roleSalary, response.roleDept)
    console.log(newRole);
    console.log("Creating a new role...\n");
    var query = connection.query(
      "INSERT INTO role SET ?",
      {
        title: response.roleTitle,
        salary: response.roleSalary,
        department_id: role.Dept
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " department added!\n");
        // Call updateProduct AFTER the INSERT completes
        // updateRole();
      })
  })
};



// "Update" functions
function updateRole() {
  inquirer.prompt(employeeQuestions).then(response => {
    console.log("Updating role...\n");
    var query = connection.query(
      "UPDATE employee SET ? WHERE ?",
      [
        {
          role: response.jobTitle
        },
        {
          first_name: response.firstName,
          last_name: response.lastName
        }
      ],
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee role updated!\n");
        // Call deleteProduct AFTER the UPDATE completes
        // deleteProduct();
      })
  })
};

// Bonus
function updateManager() {
  inquirer.prompt(employeeQuestions).then(response => {
    console.log("Updating manager...\n");
    var query = connection.query(
      "UPDATE employee SET ? WHERE ?",
      [
        {
          manager_id: response.ManagerName
        },
        {
          first_name: response.firstName,
          last_name: response.lastName
        }
      ],
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee manager updated!\n");
        // Call deleteProduct AFTER the UPDATE completes
        // deleteProduct();
      })
  })
};



// "View" functions
function viewAllEmployees() {
  console.log("Selecting all employees...\n");
  connection.query("SELECT * FROM employees", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
  })
};


function viewByDepartments() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Selecting employees by department...\n");
    // do I need a forEach loop here?
    connection.query("SELECT * FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    })
  })
};


function viewByRole() {
  inquirer.prompt(roleQuestions[0]).then(response => {
    console.log("Selecting all employees by role...\n");
    connection.query("SELECT * FROM role INNER JOIN employee ON role.id = employee.role_id", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    })
  })
};


// Bonus
function viewByManager() {
  inquirer.prompt(employeeQuestions[3]).then(response => {
    console.log("Selecting employees by manager...\n");
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    })
  })
};


// Bonus
function viewDeptBudget() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Calculating budget by department...\n");
    // department.name
    // number of roles in department: INNER JOIN department.id = roles.department_id -> res.affectedRows
    // number of employees per role: INNER JOIN roles.id = employees.role_id -> forEach res.affectedRows * roles.salary
    // add resultant products together and return total
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    })
  })
};



// "Delete" functions (all bonus)
function deleteEmployee() {
  inquirer.prompt(employeeQuestions[0], employeeQuestions[1]).then(response => {
    console.log("Deleting employee...\n");
    connection.query(
      "DELETE FROM employee WHERE ?",
      {
        first_name: response.firstName,
        last_name: response.lastName
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employees deleted!\n");
        // Call readProducts AFTER the DELETE completes
        // readProducts();
      }
    );
  })
};


function deleteRole() {
  inquirer.prompt(roleQuestions[0]).then(response => {
    console.log("Deleting role...\n");
    connection.query(
      "DELETE FROM role WHERE ?",
      {
        title: response.roleTitle,
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " roles deleted!\n");
        // Call readProducts AFTER the DELETE completes
        // readProducts();
      }
    );
  })
};

function deleteDepartment() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Deleting department...\n");
    connection.query(
      "DELETE FROM department WHERE ?",
      {
        name: response.deptName,
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " departments deleted!\n");
        // Call readProducts AFTER the DELETE completes
        // readProducts();
      }
    );
  })
};
