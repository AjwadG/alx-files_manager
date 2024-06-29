import UserCollection from '../utils/users';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (email === undefined) {
      res.status(400).json({ error: 'Missing email' });
    } else if (password === undefined) {
      res.status(400).json({ error: 'Missing password' });
    } else if (await UserCollection.getUser({ email })) {
      res.status(400).json({ error: 'Already exists' });
    } else {
      const userId = await UserCollection.createUser({ email, password });
      res.status(201).json({ id: userId, email });
    }
  }
}

export default UsersController;
module.exports = UsersController;
