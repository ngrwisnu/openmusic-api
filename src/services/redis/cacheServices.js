import redis from "redis";
import config from "../../config/env.js";

class CacheServices {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.redisServer,
      },
    });

    this._client.on("error", (error) => {
      console.log(error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (!result) throw new Error("Cache not found!");

    return result;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

export default CacheServices;
