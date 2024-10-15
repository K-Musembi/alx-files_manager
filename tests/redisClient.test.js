const { expect } = require('chai');
const redisClient = require('../utils/redis');

describe('redis client', () => {
  before(async () => {
    await redisClient.connect();
  });

  after(async () => {
    await redisClient.quit();
  });

  it('should set and get a value', async () => {
    expect.assertions(2); // Ensure two assertions are expected
    await redisClient.set('testKey', 'testValue');
    const value = await redisClient.get('testKey');
    expect(value).to.equal('testValue');
  });

  it('should return null for non-existent key', async () => {
    expect.assertions(1); // Ensure one assertion is expected
    const value = await redisClient.get('nonExistentKey');
    expect(value).to.be.null;
  });
});
