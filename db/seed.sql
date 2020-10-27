DROP DATABASE IF EXISTS datacorp_db;

CREATE DATABASE datacorp_db;

USE datacorp_db;

-- create department table --
CREATE TABLE department (
  id INT AUTO_INCREMENT,
  name VARCHAR(30), -- dept name --
  PRIMARY KEY (id)
);

-- create role table --
CREATE TABLE role (
  id INT AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL,
  department_id INT, -- reference to department role belongs to --
  PRIMARY KEY (id)
);

-- create employee table --
CREATE TABLE employee (
  id INT AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT, -- reference to role employee has --
  manager_id INT, -- reference to another employee who is manager of the current employee. This field may be null if the employee has no manager --
  PRIMARY KEY (id)
);

-- Add departments, roles, employees: INSERT into appropriate table --
-- View departments, roles, employees: INNER JOIN  --
-- Update employee roles --

-- Update employee managers: JOIN --
-- View employees by manager: JOIN --
-- Delete departments, roles, empoyees --
-- View total utilized budget of department (total combined salaries) INNER JOIN department & role, add all role.salary --