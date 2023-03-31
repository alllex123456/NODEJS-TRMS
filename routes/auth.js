const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Te rugam sa introduci o adresa de email valida.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Parola trebuie sa contina cel putin 6 caractere')
      .trim(),
  ],
  authController.postLogin
);
router.post('/logout', authController.postLogout);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Te rugam sa introduci o adresa de email valida.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              'Adresa de email este deja inregistrata in baza de utilizatori'
            );
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Parola trebuie sa contina cel putin 6 caractere')
      .trim(),
    body('repeatPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Cele doua parole nu coincid');
        }
        return true;
      }),
  ],
  authController.postSignup
);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
