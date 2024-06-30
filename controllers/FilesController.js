import mongodb from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import UserCollection from '../utils/users';
import redisClient from '../utils/redis';
import FilesCollection from '../utils/files';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const id = token ? await redisClient.get(`auth_${token}`) : null;
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await UserCollection.getUser({
      _id: mongodb.ObjectId(id),
    });
    if (!user || user.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId) {
      const parent = await FilesCollection.getFile({
        _id: mongodb.ObjectId(parentId),
      });
      if (!parent || parent.length === 0) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent[0].type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      const fileId = await FilesCollection.createFile({
        userId: mongodb.ObjectId(id),
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic === 'true',
      });
      return res.status(201).json({
        id: fileId,
        userId: id,
        name,
        type,
        isPublic: isPublic === 'true',
        parentId: parentId ? mongodb.ObjectId(parentId) : 0,
      });
    }
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const fileName = uuidv4();
    const fileId = await FilesCollection.createFile({
      name,
      userId: mongodb.ObjectId(id),
      type,
      parentId: parentId ? mongodb.ObjectId(parentId) : 0,
      isPublic: isPublic === 'true',
      localPath: `${folderPath}/${fileName}`,
    });
    const filePath = `${folderPath}/${fileId}`;
    const dataBuffer = Buffer.from(data, 'base64').toString('utf-8');
    fs.writeFileSync(filePath, dataBuffer);
    return res.status(201).json({
      id: fileId,
      userId: id,
      name,
      type,
      isPublic: isPublic === 'true',
      parentId: parentId || 0,
    });
  }
}

export default FilesController;
module.exports = FilesController;
