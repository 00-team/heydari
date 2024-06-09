
create table if not exists users (
    id integer primary key not null,
    name text,
    phone text not null,
    token text not null,
    photo text,
    admin boolean not null default false,
    banned boolean not null default false
);

create table if not exists product_tags (
    id integer primary key not null,
    name text not null,
    kind integer not null,
    part integer not null,
    count integer not null default 0
);

create table if not exists products (
    id integer primary key not null,
    name text not null,
    code text not null,
    detail text not null default "",
    timestamp integer not null,
    thumbnail text,
    photos text not null default "[]",
    tag_leg integer references product_tags(id) on delete set null,
    tag_bed integer references product_tags(id) on delete set null
);

