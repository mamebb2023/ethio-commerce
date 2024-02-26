import express from 'express';
import path from 'path';

import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import userUtils from '../utils/user';

const router = express.Router();

const routerController = (app) => {
  app.use(express.static(path.resolve(__dirname, '../views')));
  app.use('/', router);

  // Templates
  router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../views/index.html')));
  router.get('/about', (req, res) => res.sendFile(path.resolve(__dirname, '../views/about.html')));
  router.get('/register', (req, res) => res.sendFile(path.resolve(__dirname, '../views/register.html')));
  router.get('/login', (req, res) => res.sendFile(path.resolve(__dirname, '../views/login.html')));

  router.get('/admin', AuthController.verifyUser, userUtils.isAdmin, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/admin.html'));
  });

  router.get('/user/me', AuthController.verifyUser, (req, res) => { 
    res.sendFile(path.resolve(__dirname, '../views/user_panel.html'));
  });

  router.get('/user/cart', AuthController.verifyUser, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/cart.html'));
  });

  // App Controller
  router.get('/status', (req, res) => AppController.getStatus(req, res));
  router.get('/stats', (req, res) => AppController.getStats(req, res));

  // User Controller
  router.post('/login', (req, res) => UserController.userLogin(req, res));
  router.post('/register', (req, res) => UserController.userRegister(req, res));
  router.post('/logout', AuthController.verifyUser, (req, res) => UserController.userLogout(req, res));

  // Auth Controller
  router.post('/verifyUser', AuthController.verifyUser, (req, res) => UserController.getUser(req, res));
};

export default routerController;
