DROP DATABASE IF EXISTS datacorp_db;

CREATE DATABASE datacorp_db;

USE datacorp_db;

CREATE TABLE department (
  id INT AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL,
  department_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE employee (
  id INT AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  manager_id INT,
  PRIMARY KEY (id)
);

-- Add departments, roles, employees: INSERT into appropriate table --
-- View departments, roles, employees: JOIN --
-- Update employee roles --

-- Update employee managers: JOIN --
-- View employees by manager: JOIN --
-- Delete departments, roles, empoyees --
-- View total utilized budget of department (total combined salaries) --