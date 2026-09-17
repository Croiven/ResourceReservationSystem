process.env['DATABASE_URL'] ??=
  'postgresql://postgres:postgres@localhost:5432/resource_reservation?schema=public';
process.env['JWT_ACCESS_SECRET'] ??= 'test-access-secret-min-32-characters-long';
process.env['JWT_REFRESH_SECRET'] ??= 'test-refresh-secret-min-32-characters-long';
