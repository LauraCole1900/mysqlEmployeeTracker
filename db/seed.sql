USE datacorp_db;

INSERT INTO department (name)
VALUES ("Sales"), ("Marketing"), ("IT");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales manager", 63072.10, 1),
("Salesman", 26937.97, 1),
("Marketing director", 63976.23, 2),
("Marketer", 30001.01, 2),
("Senior IT director", 96969.69, 3),
("IT developer", 69723.01, 3),
("Junior IT developer", 46347.63, 3);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Ebeneezer", "Scrooge", 1),
("Moist", "von Lipwig", 3),
("Patricia", "Parker", 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Bob", "Cratchett", 2, 1),
("Veronica", "Vermeer", 2, 1),
("Wilson", "Wilson", 2, 1),
("Frederika", "vanderBeer", 2, 1),
("Miguel", "Mascaranes", 2, 1),
("Jasmin", "Khan", 4, 2),
("Graham", "St. Clair", 4, 2),
("Rose", "Tyler", 4, 2),
("Donna", "Noble", 4, 2),
("Sarah Jane", "Smith", 6, 3),
("Ryan", "Sinclair", 6, 3),
("Rory", "Williams", 6, 3),
("Clara", "Oswald", 7, 3),
("Michael", "Smith", 7, 3),
("Jack", "Harkness", 7, 3),
("Kate", "Lethbridge-Stewart", 7, 3);