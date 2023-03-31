exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    page: 'Pagina nu exista',
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', { page: 'A aparut o eroare' });
};
