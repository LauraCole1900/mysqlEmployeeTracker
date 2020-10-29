const inquirer = require("inquirer");
require("console.table");
const app = require("./db/app.js");
const Employee = require("./db/lib/Employee.js");
const connection = require("./db/connection.js");


// function to open the process
function openProcess() {
  inquirer.prompt(
    {
      type: "list",
      message: "What would you like to do?",
      name: "action",
      choices: ["Add Department", "Add employee", "Add role", "Delete department", "Delete employee", "Delete role", "Update employee manager", "Update employee role", "View all employees", "View employees by department", "View employees by manager", "View employees by role", "View budget by department", "Done"]
    }
  ).then(function (response) {
    console.log(response)
    switch (response.action) {
      case "Add department": addDepartment()
        break
      case "Add employee": addEmployee()
        break
      case "Add role": addRole()
        break
      case "Delete department": deleteDepartment()
        break
      case "Delete employee": deleteEmployee()
        break
      case "Delete role": deleteRole()
        break
      case "Update employee manager": updateManager()
        break
      case "Update employee role": updateRole()
        break
      case "View all employees": viewAllEmployees()
        break
      case "View employees by department": viewByDepartments()
        break
      case "View employees by manager": viewByManager()
        break
      case "View employees by role": viewByRole()
        break
      case "View budget by department": viewDeptBudget()
        break
      default: process.exit();
    }
  })
};


// "Populate list" functions
// This works
function deptList() {
  connection.query("SELECT name FROM department", function (err, res) {
    const deptNames = [];
    res.forEach(departmentObj => deptNames.push(departmentObj.name))
    return deptNames;
  })
}


function managerList() {
  connection.query("SELECT CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL", function (err, res) {
    const managerNames = [];
    // loop through the result set and put the values into an array for inquirer
    res.forEach(managerObj => managerNames.push(managerObj.manager_name))
    console.log(managerNames)
    return managerNames;
  })
}

// This works
function roleList() {
  connection.query("SELECT title FROM role", function (err, res) {
    const roleNames = [];
    res.forEach(roleObj => roleNames.push(roleObj.title))
    return roleNames;
  })
};


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
    type: "list",
    message: "In which department is this role?",
    name: "roleDept",
    choices: deptList()
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
    type: "list",
    message: "What is the employee's job title?",
    name: "jobTitle",
    choices: roleList()
  },
  {
    type: "list",
    message: "Who is the employee's manager?",
    name: "managerName",
    choices: managerList()
  },
]



// ==========================================================

// Department functions
function addDepartment() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Creating a new department...\n");
    var query = connection.query(
      "INSERT INTO department SET ?",
      {
        name: response.deptName
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " department added!\n");
        openProcess();
      }
    );
  }).catch(function (err) {
    if (err) throw err;
  })
};


function viewByDepartments() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Selecting employees by department...\n");
    // do I need a forEach loop here?
    connection.query("SELECT department.id, department.name, role.id, role.title, role.department_id, employee.first_name, employee.last_name, employee.role_id FROM department INNER JOIN role ON department.id = role.department_id AND INNER JOIN employee ON role.id = employee.role_id", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
    })
  })
  openProcess();
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
      console.table(res);
    })
  })
  openProcess();
};


// Bonus
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
  openProcess();
};



// Employee functions
function addEmployee() {
  connection.query("INSERT INTO employee SET ?", function (err, res) {
    inquirer.prompt(employeeQuestions).then(response => {

      if (err) throw err;
      console.log("Employee added!\n");
      openProcess();
    })
  })
};

// This works
function viewAllEmployees() {
  console.log("Selecting all employees...\n");
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    console.table(res);
    openProcess();
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
  openProcess();
};


// Bonus
function viewByManager() {
  inquirer.prompt(employeeQuestions[3]).then(response => {
    console.log("Selecting employees by manager...\n");
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
    })
  })
  openProcess();
};


// Bonus
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
  openProcess();
};



//Role functions
function addRole() {
  inquirer.prompt(roleQuestions).then(response => {
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
  openProcess();
};


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
  openProcess();
};


function viewByRole() {
  inquirer.prompt(roleQuestions[0]).then(response => {
    console.log("Selecting all employees by role...\n");
    connection.query("SELECT role.id, role.title, employee.first_name, employee.last_name, employee.role_id FROM role INNER JOIN employee ON role.id = employee.role_id", function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
    })
  })
  openProcess();
};


// Bonus
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
  openProcess();
};



// BEGIN
openProcess();

// initialize function


// Build a command-line application that at a minimum allows the user to:
// Add departments, roles, employees
// View departments, roles, employees
// Update employee roles

// Bonus points if you're able to:
// Update employee managers
// View employees by manager
// Delete departments, roles, and employees
// View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// inquirer
// ask user what they want to do (list? checkbox?)
// (GET) View all employees
// (GET) View employees by department
// (GET) View employees by title/role
// == (GET) View budget by department ==
// == (GET) View employees by manager ==
// (POST) Add employee [{firstname (input)}, {lastname (input)}, {title/role (input? list? checkbox?)}, {department (list/checkbox)}, {salary?}, {manager (list/checkbox)}]
// (POST) Add department [{department name (input)}, {which employees (list/checkbox)}]
// (POST) Add title/role [{name of title/role (input)}, {which employee (list/checkbox)}]
// == (DELETE) Remove employee ==
// == (DELETE) Remove department ==
// == (DELETE) Remove title/role ==
// (PUT) Update employee title/role
// == (PUT) Update employee manager ==

// table data
// id
// firstname
// lastname
// title/role
// department
// salary
// manager

// DROP DATABASE IF EXISTS