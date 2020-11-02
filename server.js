const inquirer = require("inquirer");
require("console.table");
const connection = require("./db/connection.js");

let deptNames = [];
let managerNames = [];

// function to open the process
function openProcess() {
  inquirer.prompt(
    {
      type: "list",
      message: "What would you like to do?",
      name: "action",
      choices: ["Add department", "Add employee", "Add role", "Delete employee", "Update employee role", "View departments", "View all employees", "View employees by department", "View employees by role", "View roles", "Done"]
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
      case "Delete employee": deleteEmployee()
        break
      case "Update employee role": updateRole()
        break
      case "View departments": viewDepartments()
        break
      case "View all employees": viewAllEmployees()
        break
      case "View employees by department": viewByDepartments()
        break
      case "View employees by role": viewByRole()
        break
      case "View roles": viewRoles()
        break
      default: process.exit();
    }
  }).catch(function (err) {
    if (err) throw err;
  })
};

// Creates list of departments
function getDeptNames() {
  return new Promise(function (resolve, reject) {
    connection.query("SELECT name FROM department", function (err, res) {
      const names = res.map(obj => obj.name);
      resolve(names);
    })
  });
};

// Creates list of employees
function getEmployeeNames() {
  return new Promise(function (resolve, reject) {
    const queryStr = "SELECT CONCAT(first_name,' ',last_name) AS employee_name FROM employee";
    connection.query(queryStr, function (err, res) {
      const names = res.map(obj => obj.employee_name);
      resolve(names);
    })
  })
}

// Creates list of managers
function getManagerNames() {
  return new Promise(function (resolve, reject) {
    const queryStr = "SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL";
    connection.query(queryStr, function (err, res) {
      const names = res.map(obj => obj.manager_name);
      resolve(names);
    })
  });
};

// Creates list of roles
function getRoleNames() {
  return new Promise(function (resolve, reject) {
    connection.query("SELECT id, title FROM role", function (err, res) {
      const names = res.map(obj => obj.title);
      resolve(names);
    })
  });
};

// Resolves department_id for role table when given name of department
function getDepartmentId(questionObj) {
  return new Promise(function (resolve, reject) {
    inquirer.prompt(questionObj).then(response => {
      const queryStr = "SELECT id FROM department WHERE ?";
      connection.query(queryStr, { name: response.roleDept }, function (err, data) {
        resolve(data[0].id)
      })
    });
  });
};

// Resolves role_id for employee table when given name of role
function getRoleId(questionObj) {
  return new Promise(function (resolve, reject) {
    inquirer.prompt(questionObj).then(response => {
      const queryStr = "SELECT id FROM role WHERE ?";
      connection.query(queryStr, { title: response.jobTitle }, function (err, data) {
        resolve(data[0].id)
      })
    });
  });
};

// Resolves manager_id for employee table when given manager's name
function getManagerId(questionObj) {
  return new Promise(function (resolve, reject) {
    inquirer.prompt(questionObj).then(response => {
      const mName = response.managerName.split(" ");
      const fName = mName[0];
      const lName = mName[1];
      const queryStr = "SELECT id FROM employee WHERE ?";
      connection.query(queryStr, [{ first_name: fName }, { last_name: lName }], function (err, data) {
        resolve(data[0].id)
      })
    });
  });
};

// Inserts the department names array into answer choices and returns relevant role question
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

// Inserts the manager and role names arrays into answer choices and returns relevant employee questions
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

// Inserts the department names array into answer choices and returns the dept question
function getDepartmentQuestion(deptNames) {
  return {
    type: "list",
    message: "Which department?",
    name: "chosenDept",
    choices: deptNames
  };
};

// Inserts the role names array into answer choices and returns the role question
function getRoleNameQuestion(roleNames) {
  return {
    type: "list",
    message: "New role?",
    name: "jobTitle",
    choices: roleNames
  }
};

// Inserts the employee names array into answer choices and returns the employee question
function getEmployeeNameQuestion(employeeNames) {
  return {
    type: "list",
    message: "Which employee?",
    name: "employeeChoice",
    choices: employeeNames
  }
};

// ==========================================================
// Department functions
function viewDepartments() {
  console.log("Selecting all departments...\n");
  connection.query(
    "SELECT * FROM department", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
};


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


async function viewByDepartments() {
  const deptNames = await getDeptNames();
  const deptListQ = await getDepartmentQuestion(deptNames);
  inquirer.prompt(deptListQ).then(response => {
    console.log(response);
    console.log("Selecting employees by department...\n");
    connection.query("SELECT department.id, department.name, role.id, role.title, role.department_id, employee.first_name, employee.last_name, employee.role_id FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id WHERE ?",
      {
        name: response.chosenDept
      },
      function (err, res) {
        if (err) throw err;
        console.table(res);
        openProcess();
      })
  }).catch(function (err) {
    if (err) throw err;
  })
};



// Employee functions
async function addEmployee() {
  const managerNames = await getManagerNames();
  const roleNames = await getRoleNames();
  const employeeQuestions = await getEmployeeQuestions(managerNames, roleNames);
  const roleId = await getRoleId(employeeQuestions[0]);
  const managerId = await getManagerId(employeeQuestions[1]);
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


async function deleteEmployee() {
  const employeeNames = await getEmployeeNames();
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


function viewAllEmployees() {
  console.log("Selecting all employees...\n");
  connection.query(
    "SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
};



// Role functions
async function addRole() {
  const deptNames = await getDeptNames();
  const roleQuestion = await getRoleDeptQuestion(deptNames);
  const deptId = await getDepartmentId(roleQuestion);
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


async function updateRole() {
  const employeeNames = await getEmployeeNames();
  const roleNames = await getRoleNames();
  const roleQuestion = await getRoleNameQuestion(roleNames);
  const roleId = await getRoleId(roleQuestion);
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
          console.log(res.affectedRows + " employee role updated!\n");
          openProcess();
        })
    }).catch(function (err) {
      if (err) throw err;
    })
};


async function viewByRole() {
  const roleNames = await getRoleNames();
  const roleQuestion = await getRoleNameQuestion(roleNames);
  inquirer.prompt(roleQuestion).then(response => {
    console.log("Selecting all employees by role...\n");
    connection.query("SELECT role.id, role.title, employee.first_name, employee.last_name, employee.role_id FROM role INNER JOIN employee ON role.id = employee.role_id WHERE ?",
      {
        title: response.jobTitle
      },
      function (err, result) {
        if (err) throw err;
        console.table(result);
        openProcess();
      })
  }).catch(function (err) {
    if (err) throw err;
  })
};


function viewRoles() {
  console.log("Selecting all roles...\n");
  connection.query(
    "SELECT id, title FROM role", function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
};


// BEGIN
openProcess();