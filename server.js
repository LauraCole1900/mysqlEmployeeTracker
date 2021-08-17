const inquirer = require("inquirer");
require("console.table");
const connection = require("./db/connection.js");


// function to open the process
function openProcess() {
  inquirer.prompt(
    {
      type: "list",
      message: "What would you like to do?",
      name: "action",
      choices: ["Add department", "Add employee", "Add role", "Delete employee", "Update employee manager", "Update employee role", "View departments", "View all employees", "View employees by department", "View employees by manager", "View employees by role", "View roles", "Done"]
    }
  ).then(function (response) {
    console.log(response)
    switch (response.action) {
      case "Add department": addDepartment();
        break;
      case "Add employee": addEmployee();
        break;
      case "Add role": addRole();
        break;
      case "Delete employee": deleteEmployee();
        break;
      case "Update employee manager": updateEmployeeManager();
        break;
      case "Update employee role": updateEmployeeRole();
        break;
      case "View departments": viewAll("department", "*");
        break;
      case "View all employees": viewAll("employee", "*");
        break;
      case "View employees by department": viewBy("department", "name", "SELECT department.id, department.name, role.id, role.title, role.department_id, employee.first_name, employee.last_name, employee.role_id FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id WHERE ?", getDepartmentQuestion);
        break;
      case "View employees by manager": viewByManager();
        break;
      case "View employees by role": viewBy("role", "id, title", "SELECT role.id, role.title, employee.first_name, employee.last_name, employee.role_id FROM role INNER JOIN employee ON role.id = employee.role_id WHERE ?", getRoleNameQuestion);
        break;
      case "View roles": viewAll("role", "id, title");
        break;
      default: process.exit();
    }
  }).catch(function (err) {
    if (err) throw err;
  })
};

// Gary gave me the "new Promise"/"await" logic & syntax

// Creates list of department, employee, manager, or role names
function getNames(queryStr, nameType) {
  let objArr;
  return new Promise(function (resolve, reject) {
    connection.query(queryStr, function (err, res) {
      const names = res.map(obj => {
        switch (nameType) {
          case "department":
            objArr = obj.name;
            break;
          case "manager":
            objArr = obj.manager_name;
            break;
          case "role":
            objArr = obj.title;
            break;
          default:
            objArr = obj.employee_name;
        }
        return objArr;
      });
      resolve(names);
    })
  });
};

// Resolves ID for employee table when given name of department, role, or manager
function getId(questionObj, table) {
  let resolver;
  return new Promise(function (resolve, reject) {
    inquirer.prompt(questionObj).then(response => {
      const queryStr = `SELECT id FROM ${table} WHERE ?`;
      switch (table) {
        case "department":
          resolver = { name: response.roleDept };
          break;
        case "role":
          resolver = { title: response.jobTitle };
          break;
        default:
          const mName = response.managerName.split(" ");
          const fName = mName[0];
          const lName = mName[1];
          resolver = [{ first_name: fName }, { last_name: lName }]
      }
      connection.query(queryStr, resolver, function (err, data) {
        resolve(data[0].id)
      })
    });
  });
};


// ==========================================================
// Functions to populate choices array(s) and return relevant question object(s)

// Role questions
function getRoleDeptQuestion(deptNames) {
  return [
    {
      type: "list",
      message: "In which department is this role?",
      name: "roleDept",
      choices: deptNames
    }
  ]
};

function getRoleNameQuestion(roleNames) {
  return {
    type: "list",
    message: "New role?",
    name: "jobTitle",
    choices: roleNames
  }
};


// Employee questions
function getEmployeeQuestions(managerNames, roleNames) {
  return [
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
  ];
};

function getEmployeeNameQuestion(employeeNames) {
  return {
    type: "list",
    message: "Which employee?",
    name: "employeeChoice",
    choices: employeeNames
  }
};


// Department question
function getDepartmentQuestion(deptNames) {
  return {
    type: "list",
    message: "Which department?",
    name: "chosenDept",
    choices: deptNames
  };
};

// ==========================================================
// CRUD functionality

// Create functions

async function addDepartment() {
  const deptQuestion = {
    type: "input",
    message: "Name of department?",
    name: "deptName"
  };
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

async function addEmployee() {
  const manQuery = "SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL";
  const roleQuery = "SELECT id, title FROM role";
  const managerNames = await getNames(manQuery, "manager");
  const roleNames = await getNames(roleQuery, "role");
  const employeeQuestions = await getEmployeeQuestions(managerNames, roleNames);
  const roleId = await getId(employeeQuestions[0], "role");
  const managerId = await getId(employeeQuestions[1], "employee");
  inquirer.prompt([
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
  ]).then(response => {
    console.log("Adding employee...\n");
    connection.query(
      "INSERT INTO employee SET ?",
      {
        first_name: response.firstName,
        last_name: response.lastName,
        role_id: roleId,
        manager_id: managerId
      },
      function (err, res) {
        if (err) throw err;
        console.log("Employee added!\n");
        openProcess();
      });
  }).catch(function (err) {
    if (err) throw err;
  })
};

async function addRole() {
  const deptQuery = "SELECT name FROM department";
  const deptNames = await getNames(deptQuery, "department");
  const roleQuestion = await getRoleDeptQuestion(deptNames);
  const deptId = await getId(roleQuestion, "department");
  inquirer.prompt(
    [
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
    ]).then(response => {
      console.log("Creating a new role...\n");
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: response.roleTitle,
          salary: response.roleSalary,
          department_id: deptId
        },
        function (err, res) {
          if (err) throw err;
          console.log("Role added!\n");
          openProcess();
        });
    }).catch(function (err) {
      if (err) throw err;
    })
};


// Read functions

// Views all given table and column names
function viewAll(table, col) {
  console.log(`Selecting all ${table}s...\n`);
  connection.query(
    `SELECT ${col} FROM ${table}`, function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
};

// Views employees by department or role given table and column names, connection query,
// and function to get the appropriate questions
async function viewBy(table, col, connQuery, qFunction) {
  let resObj;
  const dataQuery = `SELECT ${col} FROM ${table}`;
  const dataNames = await getNames(dataQuery, table);
  const dataListQ = await qFunction(dataNames);
  inquirer.prompt(dataListQ).then(response => {
    switch (table) {
      case "department":
        resObj = { name: response.chosenDept };
        break;
      case "role":
        resObj = { title: response.jobTitle };
        break;
      default:
        return null;
    }
    console.log(`Selecting all employees by ${table}...\n`);
    connection.query(connQuery, resObj,
      function (err, res) {
        if (err) throw err;
        console.table(res);
        openProcess();
      })
  }).catch(function (err) {
    if (err) throw err;
  })
};


// View employees by manager
// Get manager names
// const managerNames = await getNames(manQuery, "manager");
// Get manager ID
// const managerId = await getId(employeeQuestions[1], "employee");
// Select name from employee where manager_id: managerId
async function viewByManager() {
  const manQuery = "SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL";
  const managerNames = await getNames(manQuery, "manager");
  const employeeQuestions = await getEmployeeQuestions(managerNames, ["roles"]);
  const managerId = await getId(employeeQuestions[1], "employee");
  console.log(`Selecting all employees by manager...\n`);
  connection.query("SELECT employee.first_name, employee.last_name FROM employee WHERE ?",
    {
      manager_id: managerId
    },
    function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
    .catch(function (err) {
      if (err) throw err;
    })
}


// View department budget
// List departments
// Get roles associated with that department
// Get number of rows in employee table for each role associated with selected department
// Multiply n rows by that role's salary in the role table
// Repeat for each role in department
// Add products
// Print sum to page


// Update functions

async function updateEmployeeRole() {
  const empQuery = "SELECT CONCAT(first_name,' ',last_name) AS employee_name FROM employee";
  const roleQuery = "SELECT id, title FROM role";
  const employeeNames = await getNames(empQuery, "employee");
  const roleNames = await getNames(roleQuery, "role");
  const roleQuestion = await getRoleNameQuestion(roleNames);
  const roleId = await getId(roleQuestion, "role");
  inquirer.prompt(
    [
      {
        type: "list",
        message: "Which employee?",
        name: "employeeChoice",
        choices: employeeNames
      },
    ]).then(response => {
      console.log("Updating role...\n");
      const eName = response.employeeChoice.split(" ");
      const fName = eName[0];
      const lName = eName[1];
      connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          {
            role_id: roleId
          },
          {
            first_name: fName
          },
          {
            last_name: lName
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log(`${res.affectedRows} employee's role updated!\n`);
          openProcess();
        })
    }).catch(function (err) {
      if (err) throw err;
    })
};

async function updateEmployeeManager() {
  const empQuery = "SELECT CONCAT(first_name,' ',last_name) AS employee_name FROM employee";
  const manQuery = "SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL";
  const employeeNames = await getNames(empQuery, "employee");
  const managerNames = await getNames(manQuery, "manager");
  const employeeQuestions = await getEmployeeQuestions(managerNames, ["roles"]);
  const managerId = await getId(employeeQuestions[1], "employee");
  inquirer.prompt(
    [
      {
        type: "list",
        message: "Which employee?",
        name: "employeeChoice",
        choices: employeeNames
      },
    ]).then(response => {
      console.log("Updating manager...\n");
      const eName = response.employeeChoice.split(" ");
      const fName = eName[0];
      const lName = eName[1];
      connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          {
            manager_id: managerId
          },
          {
            first_name: fName
          },
          {
            last_name: lName
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log(`${res.affectedRows} employee's manager updated!\n`);
          openProcess();
        })
    }).catch(function (err) {
      if (err) throw err;
    })
};


// Delete functions

async function deleteEmployee() {
  const empQuery = "SELECT CONCAT(first_name,' ',last_name) AS employee_name FROM employee";
  const employeeNames = await getNames(empQuery, "employee");
  const employeeQuestion = await getEmployeeNameQuestion(employeeNames);
  inquirer.prompt(employeeQuestion).then(response => {
    const eName = response.employeeChoice.split(" ");
    const fName = eName[0];
    const lName = eName[1];
    connection.query(
      "DELETE FROM employee WHERE ? AND ?",
      [
        {
          first_name: fName
        },
        {
          last_name: lName
        }
      ],
      function (err, res) {
        if (err) throw err;
        console.log("Employee deleted!\n");
        openProcess();
      });
  }).catch(function (err) {
    if (err) throw err;
  });
};

// Delete role
// List roles
// Check that there are no employees in that role, then delete role
// If employees in role, prompt to delete employee(s) or switch employee(s) to new role
// If not, delete role

// Delete department
// Check that there are no employees in that department
// On delete, cascade for roles


// BEGIN
openProcess();