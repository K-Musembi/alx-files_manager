const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('db client', () => {
  before(async () => {
    await dbClient.connect();
  });

  after(async () => {
    await dbClient.disconnect();
  });

  it('should insert a document and retrieve it', async () => {
    expect.assertions(2);
    const doc = { name: 'Test Document' };
    const inserted = await dbClient.insert(doc);
    const found = await dbClient.findById(inserted._id);
    expect(found).to.deep.equal(doc);
  });

  it('should return null for a non-existent document', async () => {
    expect.assertions(1);
    const found = await dbClient.findById('nonExistentId');
    expect(found).to.be.null;
  });
});
