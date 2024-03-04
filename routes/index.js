import express from 'express';
import path from 'path';
import multer from 'multer';

import userUtils from '../utils/user';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import ItemController from '../controllers/ItemControler';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Replace with your desired upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000, // 1 MB limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png']; // Allowed extensions
    const extname = path.extname(file.originalname);
    cb(null, allowedExtensions.includes(extname));
  }
});

const router = express.Router();

const routerController = (app) => {
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
  app.use(express.static(path.resolve(__dirname, '../views')));
  app.use('/', router);

  // Templates
  router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../views/index.html')));
  router.get('/about', (req, res) => res.sendFile(path.resolve(__dirname, '../views/about.html')));
  router.get('/register', (req, res) => res.sendFile(path.resolve(__dirname, '../views/register.html')));
  router.get('/login', (req, res) => res.sendFile(path.resolve(__dirname, '../views/login.html')));

  // Admin utils
  router.get('/admin', AuthController.verifyUser, userUtils.isAdmin, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/admin.html'));
  });
  router.post('/post-item', AuthController.verifyUser, userUtils.isAdmin, upload.single('itemImage'),
    async (req, res) => ItemController.postItem(req, res));
  router.get('/status', AuthController.verifyUser, userUtils.isAdmin, (req, res) => AppController.getStatus(req, res));

  // User sites
  router.get('/user/me', AuthController.verifyUser, (req, res) => res.sendFile(path.resolve(__dirname, '../views/user.html')));
  router.get('/user/cart', AuthController.verifyUser, (req, res) => res.sendFile(path.resolve(__dirname, '../views/cart.html')));
  router.post('/cart', AuthController.verifyUser, (req, res) => ItemController.addToCart(req, res));
  router.get('/cart-items', AuthController.verifyUser, (req, res) => ItemController.totalCartItems(req, res));
  router.get('/cart', AuthController.verifyUser, (req, res) => ItemController.cartItems(req, res));

  router.get('/getItems', (req, res) => ItemController.getItems(req, res));
  router.get('/item-details', (req, res) => ItemController.itemDetails(req, res));
  
  // User Controller
  router.post('/login', (req, res) => UserController.userLogin(req, res));
  router.post('/register', (req, res) => UserController.userRegister(req, res));
  router.post('/logout', AuthController.verifyUser, (req, res) => UserController.userLogout(req, res));

  // Auth Controller
  router.post('/verifyUser', AuthController.verifyUser, (req, res) => UserController.getUser(req, res));
};

export default routerController;
