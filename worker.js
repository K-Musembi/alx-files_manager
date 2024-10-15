const { Worker } = require('bull');
const imageThumbnail = require('image-thumbnail');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

// const fileQueue = new Queue('fileQueue');
const worker = new Worker('fileQueue', async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const thumbnailSizes = [500, 250, 100];
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

  const thumbnailPromises = thumbnailSizes.map(async (size) => {
    const thumbnail = await imageThumbnail(path.join(folderPath, file.localPath), { width: size });
    const thumbnailPath = path.join(folderPath, `${file.localPath.split('.')[0]}_${size}.jpg`);

    fs.writeFileSync(thumbnailPath, thumbnail);
  });

  await Promise.all(thumbnailPromises);
});

worker.on('failed', (job, err) => {
  console.error(`Job failed with error ${err.message}`);
});

console.log('Worker is running...');
