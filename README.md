# MySQL Employee Management System

## Table of Contents

* [Description](#description)
* [Installation](#installation)
* [Usage](#usage)
* [Technologies Used](#technologies)
* [Tests](#tests)
* [Credits](#credits)
* [Contributing](#contributing)
* [Questions](#questions)
* [Badges](#badges)

## Description

This is a CLI employee management system application using Inquirer.js and MySQL. This system allows the user to add employees, departments, and roles; view employees (all, by department, by manager, and by role), departments, and roles; view departments' utilized budgets; update employee managers and roles; and delete employees. After drilling down into the containing folder, the user should run "npm install", then open the process by entering "node server.js", at which point the application will ask the user to select a function, then walk the user through prompts to execute the selected function.

[Link to walkthrough video](https://drive.google.com/file/d/1trfQepE9S5_PLLaUJ60OaK6sTjLwK_Eg/view)

## Installation Instructions

If you want to run a copy of this app on your local machine, you will need to install MySQL Workbench from the MySQL website here:
```
https://dev.mysql.com/downloads/mysql/
```

You will need to configure MySQL Workbench before using it. Instructions can be found here:
```
https://dev.mysql.com/doc/workbench/en/wb-mysql-connections.html
```

Then, clone the repository:

HTTPS:
```
$ git clone https://github.com/LauraCole1900/mysqlEmployeeTracker.git
```

SSH:
```
$ git clone git@github.com:LauraCole1900/mysqlEmployeeTracker.git
```

Then cd/ into the cloned directory and download the dependencies by typing into the command line
```
$ npm install --save
```

Once the dependencies and MySQL Workbench are installed and MySQL Workbench is configured, start the application by typing into the command line
```
$ node server.js
```

## Usage

This application is intended to be used to track employees, departments, and roles for an organization.

## Technologies Used

Node.js, Inquirer, Express, MySQL, console.table npm package

## Tests

npm run test

## Credits

N/A

## Contributing

We believe code is never finished, welcome your contributions to enhance the applications functionality. Please adhere to the Code of Conduct for the Contributor Covenant, version 2.0, at https://www.contributor-covenant.org/version/2/0/code_of_conduct.html.

## Questions

If you have further questions, you can reach me at lauracole1900@comcast.net. For more of my work, see [my GitHub](https://github.com/LauraCole1900).

## Badges

![License badge](https://img.shields.io/badge/license-MIT-brightgreen) [![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/LauraCole1900/mysqlEmployeeTracker)