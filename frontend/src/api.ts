import axios from 'axios';
import {Message} from './types'

export class API {

  static apiUrl = process.env.REACT_APP_API_URL;

  static ask(
    messages: Message[],
    provider: string
  ): Promise<any> {
    return axios.post(`${this.apiUrl}/ask`, {messages, provider});
  }

  static fetchMetrics(): Promise<any> {
    return axios.get(`${this.apiUrl}/metrics`);
  }

}
