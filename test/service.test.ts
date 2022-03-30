import nock from 'nock';
import { fetchUsers } from '../src/updateService';

describe('Update Service', () => {
  describe('fetchUsers', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle empty response', async () => {
      const response = {
        page: 1,
        per_page: 2,
        total: 0,
        total_pages: 1,
        data: []
      }

      nock('https://reqres.in')
        .get(/api\/users/)
        .reply(200, response);

      const users = await fetchUsers();

      expect(users).toStrictEqual([]);
    });

    it('should fetch one page', async () => {
      const response = {
        page: 1,
        per_page: 2,
        total: 2,
        total_pages: 1,
        data: [
          {
            id: 5,
            email: 'u1@example.com',
            first_name: 'u1',
            last_name: 'u1',
            avatar: 'a1'
          },
          {
            id: 6,
            email: 'u2@example.com',
            first_name: 'u2',
            last_name: 'u2',
            avatar: 'a2'
          }
        ]
      }

      nock('https://reqres.in')
        .get(/api\/users/)
        .reply(200, response);

      const users = await fetchUsers();

      expect(users).toStrictEqual(response.data);
    });

    it ('should fetch multiple pages', async () => {
      const data = Array(10).fill(0).map((_, i) => ({
        id: i,
        email: `u${i}@example.com`,
        first_name: `u${i}`,
        last_name: `u${i}`,
        avatar: `a${i}`
      }));

      nock('https://reqres.in')
        .get(/api\/users/)
        .times(4)
        .reply(200, function(_uri, _body) {
          const page = parseInt(this.req.path.split('?')[1].split('&')[0].split('=')[1])

          return {
            page: 1,
            per_page: 3,
            total: 10,
            total_pages: 4,
            data: data.slice((page-1) * 3, page * 3)
          }
        });

      const users = await fetchUsers();

      expect(users).toStrictEqual(data);
    });

    it ('should handle etags properly', async () => {
      const data = Array(10).fill(0).map((_, i) => ({
        id: i,
        email: `u${i}@example.com`,
        first_name: `u${i}`,
        last_name: `u${i}`,
        avatar: `a${i}`
      }));

      nock('https://reqres.in')
        .get(/api\/users/)
        .times(4)
        .reply(200, function(_uri, _body) {
          const page = parseInt(this.req.path.split('?')[1].split('&')[0].split('=')[1])

          return {
            page: 1,
            per_page: 3,
            total: 10,
            total_pages: 4,
            data: data.slice((page-1) * 3, page * 3)
          }
        }, {
          etag: 'test_etag'
        });

      const users = await fetchUsers();
      expect(users).toStrictEqual(data);

      const scope = nock('https://reqres.in', {
        reqheaders: {
          'if-none-match': 'test_etag'
        }
      })
        .get(/api\/users/)
        .reply(304);

      const shouldBeEmpty = await fetchUsers();

      scope.done();
      expect(shouldBeEmpty).toStrictEqual([]);
    });
  });
})
