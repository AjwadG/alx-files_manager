import AppController from '../controllers/AppController';

function routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

export default routes;
module.exports = routes;
