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
      choices: ["Add department", "Add employee", "Add role", "Update employee role", "View all employees", "View employees by department", "View employees by role", "Done"]
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
      case "Update employee role": updateRole()
        break
      case "View all employees": viewAllEmployees()
        break
      case "View employees by department": viewByDepartments()
        break
      case "View employees by role": viewByRole()
        break
      default: process.exit();
    }
  }).catch(function (err) {
    if (err) throw err;
  })
};

const deptNames = [];
const managerNames = [];
const roleNames = [];

// "Populate list" functions
// This works
function deptList() {
  connection.query("SELECT name FROM department", function (err, res) {
    deptNames = [];
    res.forEach(departmentObj => deptNames.push(departmentObj.name))
    return deptNames;
  })
}

// This works
function managerList() {
  connection.query("SELECT CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL", function (err, res) {
    managerNames = [];
    // loop through the result set and put the values into an array for inquirer
    res.forEach(managerObj => managerNames.push(managerObj.manager_name))
    return managerNames;
  })
}

// This works
function roleList() {
  connection.query("SELECT title FROM role", function (err, res) {
    roleNames = [];
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
    choices: deptNames
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
    choices: roleNames
  },
  {
    type: "list",
    message: "Who is the employee's manager?",
    name: "managerName",
    choices: managerNames
  },
]


const listDepts =
{
  type: "list",
  message: "Which department?",
  name: "deptListing",
  choices: deptNames
};


const listManagers =
{
  type: "list",
  message: "Which manager?",
  name: "managerListing",
  choices: managerNames
};


const listRoles =
{
  type: "list",
  message: "Which role?",
  name: "jobList",
  choices: roleNames
}


// ==========================================================

// Department functions
// This works
function addDepartment() {
  inquirer.prompt(deptQuestion).then(response => {
    console.log("Creating a new department...\n");
    connection.query(
      "INSERT INTO department SET ?",
      {
        name: response.deptName
      },
      function (err, res) {
        if (err) throw err;
        console.log("Department added!\n");
        openProcess();
      }
    );
  }).catch(function (err) {
    if (err) throw err;
  })
};


function viewByDepartments() {
  deptList();
  inquirer.prompt(listDepts).then(response => {
    console.log("Selecting employees by department...\n");
    connection.query("SELECT department.id, department.name, role.id, role.title, role.department_id, employee.first_name, employee.last_name, employee.role_id FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id WHERE department.name = ?", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
  }).catch(function (err) {
    if (err) throw err;
  })
};



// Employee functions
function addEmployee() {
  managerList();
  roleList();
  inquirer.prompt(employeeQuestions).then(response => {
    connection.query("INSERT INTO employee SET ?",
      {
        first_name: response.firstName,
        last_name: response.lastName,
      });
    connection.query(
      "SELECT role.title, role.id FROM role WHERE role.title = ?; INSERT INTO employee SET employee.role_id = role.id",
      {
        // need to replace response.jobTitle with that role's id
        // Find row in role with value response.jobTitle
        // grab the id of that row
        // input that id into employee.role_id
        // involves role and employee tables 
        title: response.jobTitle,
      });
    connection.query(
      "SELECT id FROM employee WHERE SUBSTRING_INDEX(?,' ',1) = first_name AND SUBSTRING_INDEX(?,' ',-1) = last_name INSERT INTO employee SET id = manager_id",
      {
        // need to replace response.managerName with that manager's id
        // parse name into first_name, last_name
        // Find row with those values
        // grab the id of that row
        // input that id here
        manager_id: response.managerName
      },
      function (err, res) {
        if (err) throw err;
        console.log("Employee added!\n");
      });
    openProcess();
  }).catch(function (err) {
    if (err) throw err;
  })
};


// This works
function viewAllEmployees() {
  console.log("Selecting all employees...\n");
  connection.query(
    "SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
};



//Role functions
function addRole() {
  deptList();
  inquirer.prompt(roleQuestions).then(response => {
    console.log("Creating a new role...\n");
    connection.query(
      "INSERT INTO role SET ?",
      {
        title: response.roleTitle,
        salary: response.roleSalary,
        // need to replace response.roleId with that role's id
        department_id: response.roleDept
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " department added!\n");
        openProcess();
      })
  }).catch(function (err) {
    if (err) throw err;
  })
};


function updateRole() {
  inquirer.prompt(employeeQuestions).then(response => {
    console.log("Updating role...\n");
    connection.query(
      "SELECT role.title, role.id FROM role WHERE role.title = ?; INSERT INTO employee SET employee.role_id = role.id WHERE ? AND ?",
      [
        {
          title: response.jobTitle
        },
        {
          first_name: response.firstName,
          last_name: response.lastName
        }
      ],
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee role updated!\n");
        openProcess();
      })
  }).catch(function (err) {
    if (err) throw err;
  })
};


function viewByRole() {
  inquirer.prompt(roleQuestions[0]).then(response => {
    console.log("Selecting all employees by role...\n");
    connection.query("SELECT role.id, role.title, employee.first_name, employee.last_name, employee.role_id FROM role INNER JOIN employee ON role.id = employee.role_id WHERE role.title = ?", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
  }).catch(function (err) {
    if (err) throw err;
  })
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