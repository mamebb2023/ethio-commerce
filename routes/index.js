import express from 'express';
import path from 'path';

import AppController from '../controllers/AppController';

const router = express.Router();

const routerController = (app) => {
  app.use('/assets', express.static(path.resolve(__dirname, '../templates/assets')));
  app.use('/', router);

  // Templates
  router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../templates/index.html')));
  router.get('/about', (req, res) => res.sendFile(path.resolve(__dirname, '../templates/about.html')));

  // App Controller
  router.get('/status', (req, res) => AppController.getStatus(req, res));
  router.get('/stats', (req, res) => AppController.getStats(req, res));
};

export default routerController;
