import dbClient from './db';

class FilesCollection {
  static async createFile(newFile) {
    const collection = dbClient.getCollection('files');
    const commandResult = await collection.insertOne(newFile);
    return commandResult.insertedId;
  }

  static async getFile(query) {
    const collection = dbClient.getCollection('files');
    const file = await collection.find(query).toArray();
    return file;
  }
}

export default FilesCollection;
