import { insertUsers, listUsers } from '../src/userRepository';
import { pool } from '../src/db';

describe('User Repository', () => {
  beforeEach(async () => {
    await pool.query('delete from users;');
  });

  it('should insert and select users', async () => {
    const data = [
      {
        external_id: 5,
        email: 'u1@example.com',
        first_name: 'u1',
        last_name: 'u1',
        avatar: 'a1'
      },
      {
        external_id: 6,
        email: 'u2@example.com',
        first_name: 'u2',
        last_name: 'u2',
        avatar: 'a2'
      }
    ]

    await insertUsers(data);

    const result = await listUsers('', 1);

    result.forEach(x => {
      delete x.id;
    })

    expect(result).toStrictEqual(data);
  });

  it('should update rows with duplicate id', async () => {
    const data = [
      {
        external_id: 5,
        email: 'u1@example.com',
        first_name: 'u1',
        last_name: 'u1',
        avatar: 'a1'
      },
      {
        external_id: 6,
        email: 'u2@example.com',
        first_name: 'u2',
        last_name: 'u2',
        avatar: 'a2'
      }
    ]

    await insertUsers(data);

    data[0].first_name = 'changed';

    await insertUsers(data);

    const result = await listUsers('', 1);

    result.forEach(x => {
      delete x.id;
    })

    expect(result).toStrictEqual(data);
  });
})
