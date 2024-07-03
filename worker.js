/* eslint no-console: off */
import Queue from 'bull';
import mongodb from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import FilesCollection from './utils/files';

const filesQue = new Queue('thumbnails');

function getObjectId(id) {
  return mongodb.ObjectId.isValid(id) ? new mongodb.ObjectId(id) : '';
}

filesQue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await FilesCollection.findOne({
    _id: getObjectId(fileId),
    userId: getObjectId(userId),
  });
  if (!file || !fs.existsSync(file.localPath)) throw new Error('File not found');

  if (file.type === 'image') {
    [500, 250, 100].forEach((width) => {
      const thumbnail = imageThumbnail(file.localPath, { width });
      fs.writeFileSync(`${file.localPath}_${width}`, thumbnail);
    });
    console.log(`Thumbnail created for file ${fileId}`);
  } else {
    console.log(`File ${fileId} is not an image`);
  }
  done();
});
