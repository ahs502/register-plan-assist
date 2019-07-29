import apiRequest from 'src/utils/apiRequest';

const request = apiRequest.bind(null, 'config');

export default class AuthorizeServise {
  /**
   * Provides all user related or public preplan headers.
   */
  static async getSecurityData(code: string): Promise<any> {
    return await request('getToken', { code });
  }
}
