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
  message: "What is the name of this department?",
  name: "deptName"
};


const roleQuestions = [
  {
    type: "input",
    message: "What is this role's title?",
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
  })
};


function addEmployee() {
  inquirer.prompt(employeeQuestions).then(response => {
    const newEmployee = new Employee(response.firstName, response.lastName, response.jobTitle, response.managerName)
    console.log(newEmployee);
  })
};


function addRole() {
  inquirer.prompt(roleQuestions).then(response => {
    const newRole = new Role(response.roleTitle, response.roleSalary, response.roleDept)
    console.log(newRole);
  })
};



// "Update" functions
function updateRole() {

};

// Bonus
function updateManager() {

};



// "View" functions
function viewAllEmployees() {

};


function viewByDepartments() {

};


function viewByRole() {

};


// Bonus
function viewByManager() {

};


// Bonus
function viewDeptBudget() {

};



// "Delete" functions (all bonus)
function deleteEmployee() {

};


function deleteRole() {

};


function deleteDepartment() {

};
