import express from 'express';
import path from 'path';

import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';

const router = express.Router();

const routerController = (app) => {
  app.use(express.static(path.resolve(__dirname, '../views'))); 
  app.set('view engine', 'hbs');
  app.use('/', router);

  // Templates
  router.get('/', (req, res) => res.render('index'));
  router.get('/about', (req, res) => res.render('about'));
  router.get('/register', (req, res) => res.render('register'));
  router.get('/login', (req, res) => res.render('login'));

  // App Controller
  router.get('/status', (req, res) => AppController.getStatus(req, res));
  router.get('/stats', (req, res) => AppController.getStats(req, res));

  // User Controller
  router.post('/login', (req, res) => UserController.postLogin(req, res));
  router.post('/register', (req, res) => UserController.postRegister(req, res));
};

export default routerController;
