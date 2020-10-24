const inquirer = require("inquirer");
const cTable = require("console.table");

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