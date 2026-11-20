-- The site advertises Foster City as part of the service area, so clients there must be able to book.
insert into service_cities (name) values ('Foster City') on conflict (name) do nothing;
