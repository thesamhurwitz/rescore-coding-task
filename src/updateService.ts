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
  insertUsers(data.map(u => {
    const external_id = u.id;
    delete u.id;
    return {
      external_id,
      ...u
    }
  }));
}

export async function fetchUsers(): Promise<UserResponse[]> {
  logger.info('Fetching users from Api')
  const result: UserResponse[] = []

  let total_pages = 1;
  let page = 1;
  while (page <= total_pages) {
    const url = base_url + `?page=${page}&per_page=40`
    logger.debug('Get request', { url });

    const response = await fetch(url);

    if (response.status > 300 && response.status < 200) {
      logger.error('External API responded with non-200 status code', { code: response.status, message: response.statusText })
      return null;
    }
    const data = await response.json() as ApiResponse;

    result.push(...data.data);

    total_pages = data.total_pages;
    page += 1;
  }

  return result;
}


