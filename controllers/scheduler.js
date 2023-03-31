const User = require('../models/user');

exports.getScheduler = (req, res, next) => {
  req.user.populate('orders').then((response) => {
    res.render('scheduler/index', {
      orders: response.orders,
      clients: response.clients,
      complete: false,
      edit: false,
      deleteOrder: false,
      setClientRate: false,
      path: '/scheduler',
      page: 'Organizator',
      success: undefined,
      error: '',
    });
  });
};

exports.getSchedulerRate = (req, res, next) => {
  const { setClientRate } = req.query;
  const { edit } = req.query;
  const { clientId } = req.params;

  const foundClient = req.user.findClient(clientId);

  req.user.populate('orders').then((response) => {
    res.render('scheduler/index', {
      orders: response.orders,
      clients: response.clients,
      complete: false,
      edit,
      foundClient,
      setClientRate,
      deleteOrder: false,
      path: '/scheduler/:clientId?setClientRate=true',
      page: 'Organizator',
      success: undefined,
      error: '',
    });
  });
};

exports.postScheduler = (req, res, next) => {
  req.user
    .addOrder(req.body)
    .then((response) => {
      res.redirect('/scheduler');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrder = (req, res, next) => {
  const { complete } = req.query;
  const { edit } = req.query;
  const { deleteOrder } = req.query;

  const order = req.user.orders.find(
    (item) => item._id.toString() === req.params.orderId.toString()
  );

  const offset = new Date().getTimezoneOffset() * 1000 * 60;
  const getLocalDate = (value) => {
    const offsetDate = new Date(value).valueOf() - offset;
    const date = new Date(offsetDate).toISOString();
    return date.substring(0, 16);
  };

  req.user
    .populate('orders')
    .then((response) => {
      res.render('scheduler/index', {
        orders: response.orders,
        clients: response.clients,
        complete,
        edit,
        deleteOrder,
        order,
        orderDeadline: getLocalDate(order.deadline),
        setClientRate: false,
        path: '/scheduler/:orderId/setRate?complete=true',
        page: 'Organizator',
        success: undefined,
        error: '',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCompleteOrder = (req, res, next) => {
  req.user
    .addToStatements(req.body)
    .then((response) => {
      res.render('scheduler/index', {
        orders: response.orders,
        clients: response.clients,
        complete: false,
        edit: false,
        deleteOrder: false,
        setClientRate: false,
        path: '/scheduler',
        page: 'Organizator',
        success: 'Comanda a fost salvata cu succes',
        error: '',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditOrder = (req, res, next) => {
  req.user
    .addOrder(req.body)
    .then((response) => {
      res.redirect('/scheduler');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteOrder = (req, res, next) => {
  const { orderId } = req.params;

  req.user
    .removeOrder(orderId)
    .then((response) => {
      res.redirect('/scheduler');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
