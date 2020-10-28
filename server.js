const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const config = require("./config.json");


connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  openProcess();
});

function openProcess() {
  inquirer.prompt(
    {
      type: "list",
      message: "What would you like to do?",
      name: "action",
      choices: ["Add Department", "Add employee", "Add role", "Delete department", "Delete employee", "Delete role", "Update employee manager", "Update employee role", "View all employees", "View employees by department", "View employees by manager", "View employees by role", "View budget by department"]
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
    }
  })
}

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