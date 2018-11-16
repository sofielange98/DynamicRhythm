
create table if not exists users(
  id varchar(40) NOT NULL PRIMARY KEY,
  email varchar(40) NOT NULL,
  name varchar(40) NOT NULL,
  country varchar(20),
  URI varchar(40)
);
