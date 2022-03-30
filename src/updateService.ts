import fetch from 'node-fetch';
import { logger } from './logger';
import { insertUsers } from './userRepository';

export interface ApiResponse {
  page: number,
  per_page: number,
  total: number,
  total_pages: number,
  data: UserResponse[]
}

export interface UserResponse {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  avatar: string
}

const base_url = 'https://reqres.in/api/users'

export async function update(): Promise<void> {
  const data = await fetchUsers();

  if (data.length < 1) {
    return;
  }

  insertUsers(data.map(u => {
    const external_id = u.id;
    delete u.id;
    return {
      external_id,
      ...u
    }
  }));
}

const etagStore = new Map<string, string>();

let total_pages = 1;
export async function fetchUsers(): Promise<UserResponse[]> {
  logger.info('Fetching users from Api')
  const result: UserResponse[] = []

  let page = 1;
  while (page <= total_pages) {
    const url = base_url + `?page=${page}&per_page=3`
    logger.debug('Get request', { url });

    const response = await fetch(url, {
      headers: {
        'if-none-match': etagStore.get(url)
      }
    });

    if (response.status === 304) {
      logger.info('External API cache hit');
      page += 1;
      continue;
    }

    if (response.status > 300 && response.status < 200) {
      logger.error('External API responded with non-200 status code', { code: response.status, message: response.statusText })
      return null;
    }

    if (response.headers.get('etag')) {
      etagStore.set(url, response.headers.get('etag'));
    }

    const data = await response.json() as ApiResponse;

    result.push(...data.data);

    total_pages = data.total_pages;
    page += 1;
  }

  return result;
}


