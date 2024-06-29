import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    const client = createClient();
    client.on('error', (err) => {
      console.log('Redis Client Error', err);
    });
    client.on('connect', () => {
      console.log('Redis Client Connected');
    });
    this.client = client;
  }

  isAlive() {
    if (this.client) {
      return true;
    }
    return false;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
module.exports = redisClient;
