create user postgrest with login password 'example';
create role admin with nologin;
create role scoped_user with nologin;
create role platform_user with nologin;
create role anonymous with nologin;
grant admin to postgrest;
grant scoped_user to postgrest;
grant platform_user to postgrest;
grant anonymous to postgrest;
