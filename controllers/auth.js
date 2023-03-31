const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendinblue = require('sib-api-v3-sdk');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    page: 'Autentificare',
    path: '/login',
    isLoggedIn: false,
    returnMessages: {
      errors: {
        wrongEmailError: req.flash('wrongEmail'),
        wrongPasswordError: req.flash('wrongPassword'),
        validationError: undefined,
        errorField: [],
      },
      success: { successReset: req.flash('successReset') },
      oldInputs: { email: '', password: '' },
    },
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      page: 'Autentificare',
      path: '/login',
      isLoggedIn: false,
      returnMessages: {
        errors: {
          wrongEmailError: req.flash('wrongEmail'),
          wrongPasswordError: req.flash('wrongPassword'),
          validationError: errors.array()[0].msg,
          errorField: errors.array(),
        },
        success: { successReset: req.flash('successReset') },
        oldInputs: { email, password },
      },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('wrongEmail', 'Adresa de email introdusa nu este inscrisa');
        return res.redirect('/login');
      }
      return bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) console.log(err);
              res.redirect('/');
            });
          } else {
            req.flash('wrongPassword', 'Parola introdusa este incorecta');
            res.render('auth/login', {
              page: 'Autentificare',
              path: '/login',
              isLoggedIn: false,
              returnMessages: {
                errors: {
                  wrongEmailError: req.flash('wrongEmail'),
                  wrongPasswordError: req.flash('wrongPassword'),
                  validationError: undefined,
                  errorField: errors.array(),
                },
                success: { successReset: req.flash('successReset') },
                oldInputs: { email, password },
              },
            });
          }
        })
        .catch((err) => {
          next(new Error(err));
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    page: 'Inscriere',
    path: '/signup',
    returnMessages: {
      errors: {
        validationError: undefined,
        errorField: [],
      },
      success: { successReset: req.flash('successReset') },
      oldInputs: { email: '', password: '' },
    },
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      page: 'Inscriere',
      path: '/signup',
      returnMessages: {
        errors: {
          validationError: errors.array()[0].msg,
          errorField: errors.array(),
        },
        success: { successReset: req.flash('successReset') },
        oldInputs: { email, password },
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((response) => {
      res.redirect('/login');

      // SEND CONFIRMATION EMAIL
      new sendinblue.TransactionalEmailsApi()
        .sendTransacEmail({
          subject: 'Inscriere reusita!',
          sender: { email: 'test@test.com', name: 'TRMS' },
          replyTo: { email: 'test@test.com', name: 'TRMS' },
          to: [{ email: email }],
          htmlContent:
            '<html><body><h2>Contul dvs. a fost creat cu succes in sistemul TRMS</h2><p>{{params.bodyMessage}}</p></body></html>',
          params: {
            bodyMessage: `Adresa ${email} a fost inscrisa ca utilizator 'Freelance' in sistemul TRMS`,
          },
        })
        .then(
          function (data) {},
          function (err) {
            next(new Error(err));
          }
        );
      ///////////////////////////
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    page: 'Resetare parola',
    path: '/reset',
    returnMessages: {
      errors: {
        emailInputError: req.flash('wrongEmail'),
        tokenError: req.flash('tokenError'),
        errorField: [],
      },
    },
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      req.flash('tokenError', 'Nu s-a putut genera un token de resetare');
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash(
            'wrongEmail',
            'Adresa de email introdusa nu exista in baza de utilizatori'
          );
          res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((response) => {
        req.flash(
          'successReset',
          'Va rugam sa verificati casuta de email pentru link-ul de resetare a parolei'
        );

        res.render('auth/login', {
          page: 'Autentificare',
          path: '/login',
          isLoggedIn: false,
          returnMessages: {
            errors: {
              wrongEmailError: req.flash('wrongEmail'),
              wrongPasswordError: req.flash('wrongPassword'),
              validationError: errors.array()[0].msg,
              errorField: errors.array(),
            },
            success: { successReset: req.flash('successReset') },
            oldInputs: { email, password },
          },
        });

        // SEND RESET EMAIL
        return new sendinblue.TransactionalEmailsApi()
          .sendTransacEmail({
            subject: 'Resetarea parolei TRMS',
            sender: { email: 'test@test.com', name: 'TRMS' },
            replyTo: { email: 'test@test.com', name: 'TRMS' },
            to: [{ email: email }],
            htmlContent: `<html><body><h2>Ati solicitat resetarea parolei dvs. in sistemul TRMS</h2><p>Va rugam sa accesati <a href="http://localhost:3000/reset/${token}">ACEST LINK</a> pentru a va reseta parola.</p></body></html>`,
          })
          .then(
            function (data) {},
            function (err) {
              next(new Error(err));
            }
          );
        ///////////////////////////
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash(
          'tokenError',
          'Utilizatorul nu exista sau timpul pentru schimbarea parolei a expirat'
        );
        return res.render('auth/reset', {
          page: 'Resetare parola',
          path: '/reset',
          emailInputError: req.flash('wrongEmail'),
          tokenError: req.flash('tokenError'),
        });
      }
      res.render('auth/new-password', {
        page: 'Schimba parola',
        path: '/new-password',
        userId: user._id.toString(),
        token,
        error: req.flash('mismatchError'),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { password, repeatPassword, userId, token } = req.body;

  if (password.trim() !== repeatPassword.trim()) {
    req.flash('mismatchError', 'Cele doua parole nu corespund');
    return res.render('auth/new-password', {
      page: 'Schimba parola',
      path: '/new-password',
      userId,
      token,
      error: req.flash('mismatchError'),
    });
  }

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash(
          'tokenError',
          'Timpul alocat pentru schimbarea parolei a expirat'
        );
        return res.render('auth/new-password', {
          page: 'Schimba parola',
          path: '/new-password',
          userId,
          token,
          error: req.flash('tokenError'),
        });
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          req.flash('successReset', 'Parola a fost schimbata cu succes');

          res.render('auth/login', {
            page: 'Autentificare',
            path: '/login',
            isLoggedIn: false,
            returnMessages: {
              errors: {
                wrongEmailError: req.flash('wrongEmail'),
                wrongPasswordError: req.flash('wrongPassword'),
                validationError: errors.array()[0].msg,
                errorField: errors.array(),
              },
              success: { successReset: req.flash('successReset') },
              oldInputs: { email, password },
            },
          });

          // SEND CONFIRMATION EMAIL
          return new sendinblue.TransactionalEmailsApi()
            .sendTransacEmail({
              subject: 'Parola TRMS a fost resetata',
              sender: { email: 'test@test.com', name: 'TRMS' },
              replyTo: { email: 'test@test.com', name: 'TRMS' },
              to: [{ email: email }],
              htmlContent: `<html><body><h2>Acest mesaj va confirma ca parola dvs. pentru acces in sistemul TRMS a fost schimbata.</h2></body></html>`,
            })
            .then(
              function (data) {},
              function (err) {
                next(new Error(err));
              }
            );
          ///////////////////////////
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
