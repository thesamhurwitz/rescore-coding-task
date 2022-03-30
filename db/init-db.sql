create table if not exists Users (
    id serial primary key,
    external_id int unique not null,
    email text,
    first_name text,
    last_name text,
    avatar text
);
