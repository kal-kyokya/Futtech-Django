// This file contain all the app's API endpoints
import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthMiddleware from '../middlewares/AuthMiddleware.js';
import UsersController from '../controllers/UsersController.js';
import VideosController from '../controllers/VideosController.js';
import ListsController from '../controllers/ListsController.js';

/**
 * Function routing endpoints to request handlers
 * @param { Object } app - Express server instance
 */
export default function routing(app) {
  // Create a 'router' instance for all 'user' API endpoints
  const userRouter = new Router();

  // Mount the router on '/users' and all subsequent paths
  app.use('/users', userRouter);

  // UsersController
  userRouter.post('/signUp', UsersController.createNewUser);
  userRouter.get('/me', AuthMiddleware.loginRequired, UsersController.getMe);
  userRouter.get('/all', AuthMiddleware.loginRequired, UsersController.getAll);
  userRouter.get('/stats', AuthMiddleware.loginRequired, UsersController.getStats);
  userRouter.put('/:id', AuthMiddleware.loginRequired, UsersController.updateUser);
  userRouter.delete('/:id', AuthMiddleware.loginRequired, UsersController.deleteUser);

  // Create a 'router' instance for all 'authentication' API endpoints
  const authRouter = new Router();

  // Mount the router on '/auth' and all subsequent paths
  app.use('/auth', authRouter);

  // AuthController
  authRouter.post('/signIn', AuthController.signingIn);
  /* authRouter.get('/signOut', AuthMiddleware.loginRequired, AuthController.signingOut); */

  // Create a 'router' instance for all 'video' API endpoints
  const videoRouter = new Router();

  // Mount the router on '/videos' and all subsequent paths
  app.use('/videos', videoRouter);

  // VideosController
  videoRouter.post('/', AuthMiddleware.loginRequired, VideosController.createNewVideo);
  videoRouter.post('/mux', AuthMiddleware.loginRequired, VideosController.uploadVideo);
  videoRouter.get('/playback/:id', AuthMiddleware.loginRequired, VideosController.getPlaybackId);
  videoRouter.get('/get/:id', AuthMiddleware.loginRequired, VideosController.getVideo);
  videoRouter.get('/random', AuthMiddleware.loginRequired, VideosController.getRandomVideo);
  videoRouter.get('/all', AuthMiddleware.loginRequired, VideosController.getAll);
  videoRouter.get('/stats', AuthMiddleware.loginRequired, VideosController.getStats);
  videoRouter.put('/:id', AuthMiddleware.loginRequired, VideosController.updateVideo);
  videoRouter.delete('/:id', AuthMiddleware.loginRequired, VideosController.deleteVideo);

  // Create a 'router' instance for all 'list' API endpoints
  const listRouter = new Router();

  // Mount the router on '/auth' and all subsequent paths
  app.use('/lists', listRouter);

  // ListsController
  listRouter.post('/', ListsController.createNewList);
  listRouter.get('/', AuthMiddleware.loginRequired, ListsController.getList);
  listRouter.get('/stats', AuthMiddleware.loginRequired, ListsController.getStats);
  listRouter.delete('/:id', AuthMiddleware.loginRequired, ListsController.deleteList);
}
