import axios from 'axios';
import {Message} from './types'

export class API {
  static ask(
    messages: Message[]
  ): Promise<any> {
    return axios.post('http://localhost:8000/ask', {messages});
  }
}
