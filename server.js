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
      choices: ["Add department", "Add employee", "Add role", "Delete department", "Delete employee", "Delete role", "Update employee manager", "Update employee role", "View departments", "View all employees", "View employees by department", "View employees by manager", "View employees by role", "View roles", "View department budgets", "Done"]
    }
  ).then(function (response) {
    console.log(response.action)
    switch (response.action) {
      case "Add department": addDepartment();
        break;
      case "Add employee": addEmployee();
        break;
      case "Add role": addRole();
        break;
      case "Delete department": deleteDepartment();
        break;
      case "Delete employee": deleteEmployee();
        break;
      case "Delete role": deleteRole();
        break;
      case "Update employee manager": updateJobData("SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL", "employee", "manager", getEmployeeQuestions);
        break;
      case "Update employee role": updateJobData("SELECT id, title FROM role", "role", "role", getRoleNameQuestion);
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
      case "View department budgets": viewDeptBudget();
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
          resolver = { name: response.chosenDept };
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
      name: "chosenDept",
      choices: deptNames
    }
  ]
};

function getRoleNameQuestion(roleNames) {
  return {
    type: "list",
    message: "Which role?",
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
async function viewByManager() {
  const manQuery = "SELECT id, CONCAT(first_name,' ',last_name) AS manager_name FROM employee WHERE manager_id IS NULL";
  const managerNames = await getNames(manQuery, "manager");
  const employeeQuestions = await getEmployeeQuestions(managerNames);
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
};

// View department budgets
async function viewDeptBudget() {
  const budgetQuery = "SELECT department.id, department.name, SUM(role.salary) AS total_budget FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id GROUP BY department.id, department.name";
  connection.query(budgetQuery,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      openProcess();
    })
    .catch(function (err) {
      if (err) throw err;
    })
};


// Update function

// Update employee manager or role given table and condition (manager or role) names,
// query to get array of condition names, and function to get the appropriate questions
async function updateJobData(dataQuery, table, cond, qFunction) {
  let dataId;
  let resObj;
  const empQuery = "SELECT CONCAT(first_name,' ',last_name) AS employee_name FROM employee";
  const employeeNames = await getNames(empQuery, "employee");
  const dataNames = await getNames(dataQuery, cond);
  const dataQuestion = await qFunction(dataNames);
  switch (table) {
    case "employee":
      dataId = await getId(dataQuestion[1], table);
      break;
    default:
      dataId = await getId(dataQuestion, table);
  }
  switch (cond) {
    case "role":
      resObj = { role_id: dataId };
      break;
    default:
      resObj = { manager_id: dataId }
  }
  inquirer.prompt(
    [
      {
        type: "list",
        message: "Which employee?",
        name: "employeeChoice",
        choices: employeeNames
      },
    ]).then(response => {
      console.log(`Updating ${cond}...\n`);
      const eName = response.employeeChoice.split(" ");
      const fName = eName[0];
      const lName = eName[1];
      connection.query(
        "UPDATE employee SET ? WHERE ? AND ?",
        [
          resObj,
          {
            first_name: fName
          },
          {
            last_name: lName
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log(`${res.affectedRows} employee's ${cond} updated!\n`);
          openProcess();
        })
    }).catch(function (err) {
      if (err) throw err;
    })
};


// Delete functions

// Delete employee by name
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

// Delete role by ID
async function deleteRole() {
  const roleQuery = "SELECT id, title FROM role";
  const roleNames = await getNames(roleQuery, "role");
  const roleQuestion = getRoleNameQuestion(roleNames);
  const roleId = await getId(roleQuestion, "role");
  // Checks whether there are employees in that role
  connection.query(`SELECT id FROM employee WHERE ?`,
    {
      role_id: roleId
    },
    function (err, res) {
      if (err) throw err;
      switch (res.length) {
        // If no employees in role, deletes role
        case 0:
          connection.query("DELETE FROM role WHERE ?",
            {
              id: roleId
            },
            function (err, res) {
              if (err) throw err;
              console.log("Role deleted!\n")
              openProcess();
            })
            .catch(function (err) {
              if (err) throw err;
            })
          break;
        default:
          // If employees in role, confirms whether user wants to continue
          inquirer.prompt({
            type: "list",
            message: `${res.length} employee(s) currently hold this role. If you delete this role, those employees will also be deleted. Continue?`,
            name: "roleConfirm",
            choices: ["Yes", "No"]
          }).then(function (res) {
            console.log(res);
            switch (res.roleConfirm) {
              case "No":
                openProcess();
                break;
              // If confirmed, deletes role and relevant employee(s)
              default:
                connection.query(`DELETE role, employee FROM role INNER JOIN employee ON role.id = employee.role_id WHERE role.id = ${roleId}`,
                  function (err, res) {
                    if (err) throw err;
                    console.log("Role and employee(s) deleted!\n")
                    openProcess();
                  })
                  .catch(function (err) {
                    if (err) throw err;
                  })
            }
          })
      }
    })
}

// Delete department
// On delete, cascade for roles
async function deleteDepartment() {
  const deptQuery = "SELECT name, id FROM department"
  const deptNames = await getNames(deptQuery, "department");
  const deptQuestion = getDepartmentQuestion(deptNames);
  const deptId = await getId(deptQuestion, "department")
  console.log(deptId);
  // Checks whether there are any employees in that department
  cQuery = `SELECT employee.id, role.id FROM employee INNER JOIN role ON employee.role_id = role.id WHERE role.department_id = ${deptId}`
  connection.query(cQuery, function (err, res) {
    if (err) throw err;
    console.log(res.length);
    switch (res.length) {
      // If not, confirms that user wants to delete department and associated role(s)
      case 0:
        inquirer.prompt({
          type: "list",
          message: "This action will also delete all roles in this department. Continue?",
          name: "deptRoleConfirm",
          choices: ["Yes", "No"]
        }).then(function (res) {
          console.log(res);
          switch (res.deptRoleConfirm) {
            case "No":
              openProcess();
              break;
            // If confirmed, deletes department and associated role(s)
            default:
              // Checks whether there are roles in the department
              connection.query(`SELECT id FROM role WHERE role.department_id = ${deptId}`,
                function (err, res) {
                  if (err) throw err;
                  switch (res.length) {
                    // If no roles, deletes department
                    case 0:
                      connection.query(`DELETE FROM department WHERE id = ${deptId}`,
                        function (err, res) {
                          if (err) throw err;
                          console.log("Department and associated roles deleted!\n")
                          openProcess();
                        })
                      break;
                    // If yes roles, deletes department and roles
                    default:
                      connection.query(`DELETE department, role FROM department INNER JOIN role ON department.id = role.department_id WHERE department.id = ${deptId}`,
                        function (err, res) {
                          if (err) throw err;
                          console.log("Department and associated roles deleted!\n")
                          openProcess();
                        })
                        .catch(function (err) {
                          if (err) throw err;
                        })
                  }
                })
          }
        })
        break;
      // If there are employees in the department, confirms that user wants to delete department
      // and associated role(s) and employee(s)
      default:
        inquirer.prompt({
          type: "list",
          message: `This action will also delete the ${res.length} employee(s) and any associated roles in this department. Continue?`,
          name: "deptEmployeeConfirm",
          choices: ["Yes", "No"]
        }).then(function (res) {
          console.log(res);
          switch (res.deptEmployeeConfirm) {
            case "No":
              openProcess();
              break;
            // TODO: If confirmed, deletes department and associated role(s) and employee(s)
            default:
              openProcess();
          }
        })
    }
  })
}


// BEGIN
openProcess();