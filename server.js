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
      case "View departments": viewAll("department", "*")
        break
      case "View all employees": viewAll("employee", "*")
        break
      case "View employees by department": viewByDepartments()
        break
      case "View employees by role": viewByRole()
        break
      case "View roles": viewAll("role", "id, title")
        break
      default: process.exit();
    }
  }).catch(function (err) {
    if (err) throw err;
  })
};

// Gary gave me the "new Promise"/ "await" logic & syntax

// Creates list of department, employee, manager, or role names
function getNames(queryStr, nameType) {
  let objArr;
  return new Promise(function (resolve, reject) {
    connection.query(queryStr, function (err, res) {
      const names = res.map(obj => {
        switch (nameType) {
          case "dept":
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
        console.log("objArr", objArr);
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
  const deptQuery = "SELECT name FROM department";
  const deptNames = await getNames(deptQuery, "dept");
  console.log("deptNames", deptNames);
  const deptListQ = await getDepartmentQuestion(deptNames);
  console.log("deptListQ", deptListQ);
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


// Role functions
async function addRole() {
  const deptQuery = "SELECT name FROM department";
  const deptNames = await getNames(deptQuery, "dept");
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

async function updateRole() {
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
          console.log(res.affectedRows + " employee role updated!\n");
          openProcess();
        })
    }).catch(function (err) {
      if (err) throw err;
    })
};

async function viewByRole() {
  const roleQuery = "SELECT id, title FROM role";
  const roleNames = await getNames(roleQuery, "role");
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


// function viewRoles() {
//   console.log("Selecting all roles...\n");
//   connection.query(
//     "SELECT id, title FROM role", function (err, res) {
//       if (err) throw err;
//       console.table(res);
//       openProcess();
//     })
// };


// BEGIN
openProcess();