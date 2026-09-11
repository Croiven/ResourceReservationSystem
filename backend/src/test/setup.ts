import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env['DATABASE_URL'] ??=
    'postgresql://postgres:postgres@localhost:5432/resource_reservation?schema=public';
});
