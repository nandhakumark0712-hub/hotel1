const Redis = require('ioredis');

let client = null;
let isConnected = false;

const connect = () => {
    try {
        client = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.warn('[Redis] Max retry attempts reached. Running without cache.');
                    return null; // stop retrying
                }
                return Math.min(times * 200, 1000);
            },
            lazyConnect: true,
            connectTimeout: 3000
        });

        client.on('connect', () => {
            isConnected = true;
            console.log('✅ Redis Connected');
        });

        client.on('error', (err) => {
            isConnected = false;
            if (err.code === 'ECONNREFUSED') {
                console.warn('[Redis] Server not running. Cache disabled - app continues normally.');
            }
        });

        client.on('close', () => {
            isConnected = false;
        });

        client.connect().catch(() => {
            isConnected = false;
        });

    } catch (err) {
        console.warn('[Redis] Failed to initialize. Cache disabled.');
    }
};

// Get value from Redis cache
const get = async (key) => {
    if (!isConnected || !client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Set value in Redis cache with TTL in seconds
const set = async (key, value, ttlSeconds = 300) => {
    if (!isConnected || !client) return;
    try {
        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
        // Silently fail - cache is optional
    }
};

// Delete cached key(s) by pattern
const invalidate = async (...keys) => {
    if (!isConnected || !client) return;
    try {
        await Promise.all(keys.map(key => client.del(key)));
    } catch {
        // Silently fail
    }
};

// Delete all keys matching a pattern (e.g. 'hotels:*')
const invalidatePattern = async (pattern) => {
    if (!isConnected || !client) return;
    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch {
        // Silently fail
    }
};

module.exports = { connect, get, set, invalidate, invalidatePattern, isConnected: () => isConnected };
