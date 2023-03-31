const User = require('../models/user');
const fs = require('fs');
const path = require('path');

exports.getUser = (req, res, next) => {
  const { editing } = req.query;

  req.user.populate().then((response) => {
    const user = {
      name: response.name,
      legalName: response.legalName,
      email: response.email,
      image: response.image,
      password: response.password,
      companyRegistration: response.companyRegistration,
      taxNumber: response.taxNumber,
      registeredOffice: response.registeredOffice,
    };
    res.render('profile/index.ejs', {
      page: 'Profil utilizator',
      path: '/profile',
      user,
      editing,
    });
  });
};

exports.postUser = (req, res, next) => {
  req.user
    .editUser(req.body, req.file)
    .then((response) => {
      res.redirect('/profile');
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};
