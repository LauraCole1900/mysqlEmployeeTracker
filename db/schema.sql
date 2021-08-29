DROP DATABASE IF EXISTS datacorp_db;

CREATE DATABASE datacorp_db;

USE datacorp_db;

-- create department table --
CREATE TABLE department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) -- dept name --
);

-- create role table --
CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30),
  salary DECIMAL(10,2),
  department_id INT -- reference to department role belongs to --
  INDEX dep_ind (department_id),
  CONSTRAINT fk_department
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE CASCADE
);

-- create employee table --
CREATE TABLE employee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  manager_id INT, -- reference to another employee who is manager of the current employee. This field may be null if the employee has no manager --
  INDEX man_ind (manager_id),
  CONSTRAINT fk_manager 
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL,
  role_id INT, -- reference to role employee has --
  INDEX role_ind (role_id),
  CONSTRAINT fk_role
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE CASCADE
);

-- Add departments, roles, employees: INSERT into appropriate table --
-- View departments, roles, employees: INNER JOIN  --
-- Update employee roles --

-- Update employee managers: JOIN --
-- View employees by manager: JOIN --
-- Delete departments, roles, empoyees --
-- View total utilized budget of department (total combined salaries) INNER JOIN department & role, add all role.salary --