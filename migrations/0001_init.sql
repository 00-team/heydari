
create table if not exists users (
    id integer primary key not null,
    name text,
    phone text not null,
    token text not null,
    photo text,
    admin boolean not null default false,
    banned boolean not null default false
);

create table if not exists products (
    id integer primary key not null,
    name text not null,
    detail text,
    timestamp integer not null,
    photos text not null default "[]"
    -- base integer not null,
    -- group integer not null,
    -- model integer not null
);

