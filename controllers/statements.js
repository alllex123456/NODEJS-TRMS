exports.getStatements = (req, res, next) => {
  req.user.populate('clients').then((response) => {
    const { clients } = response;

    res.render('statements/index', {
      path: '/statements',
      page: 'Situatii clienti',
      clients,
    });
  });
};
