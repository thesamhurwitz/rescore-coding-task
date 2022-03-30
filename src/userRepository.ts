import { logger } from './logger';
import { pool } from './db';


export interface UserModel {
  id: number,
  external_id: number,
  email: string,
  first_name: string,
  last_name: string,
  avatar: string
}

export async function insertUsers(users: Omit<UserModel, 'id'>[]): Promise<void> {
  logger.info('Inserting users into database', { length: users.length });
  const values = users.map(u => `(${u.external_id}, '${u.email}', '${u.first_name}', '${u.last_name}', '${u.avatar}')`)
    .join(',');

  const query = `
    insert into Users (external_id, email, first_name, last_name, avatar) values
    ${values}
    on conflict (external_id) do update set
      email=excluded.email,
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      avatar=excluded.avatar;
  `;

  const res = await pool.query(query);

  logger.info('Inserted successfully', { rowsProcessed: res.rowCount });
}

export async function listUsers(searchQuery: string, page: number): Promise<UserModel[]> {
  const limit = 10;
  const query = `
    select id, external_id, email, first_name, last_name, avatar from Users
    where concat(first_name, ' ', last_name) ilike '%${searchQuery}%'
    offset ${(page - 1) * limit}
    limit ${limit};
  `;

  const res = await pool.query(query);

  return res.rows;
}
