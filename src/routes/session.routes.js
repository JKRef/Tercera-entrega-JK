import { Router } from 'express';
import { passportCall } from '../utils.js';
import SessionController from '../controllers/session.controller.js'

const router = Router();

// -- login
router.post('/login', SessionController.login);

// -- register user
router.post('/register', SessionController.register);

// -- change an user rol between user and premium
router.get('/premium/:uid', SessionController.changeRole);

// -- restore password request
router.post('/sendMail', SessionController.passwordRecoveryRequest);

// -- set a new user password
router.post('/newUserPassword', SessionController.validateNewPassword);

// -- current jsonwebtoken
router.get('/current', passportCall('current'), SessionController.current);

// -- logout
router.get('/logout', SessionController.handleLogout);

export default router;