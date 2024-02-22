import express from 'express';
import path from 'path';

import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';

const router = express.Router();

const routerController = (app) => {
  app.use(express.static(path.resolve(__dirname, '../views')));
  app.use('/', router);

  // Templates
  router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../views/index.html')));
  router.get('/register', (req, res) => res.sendFile(path.resolve(__dirname, '../views/register.html')));
  router.get('/login', (req, res) => res.sendFile(path.resolve(__dirname, '../views/login.html')));

  // App Controller
  router.get('/status', (req, res) => AppController.getStatus(req, res));
  router.get('/stats', (req, res) => AppController.getStats(req, res));

  // User Controller
  router.post('/login', (req, res) => UserController.postLogin(req, res));
  router.post('/register', (req, res) => UserController.postRegister(req, res));

  // Auth Controller
  router.post('/validate', (req, res) => AuthController.validateUser(req, res));
};

export default routerController;
