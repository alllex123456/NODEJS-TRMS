const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const PDFConstructor = require('pdfkit');

exports.getClients = (req, res, next) => {
  req.user.populate('clients').then((response) => {
    res.render('clients/index.ejs', {
      clients: response.clients.sort(),
      path: '/clients',
      page: 'Clienti',
      returnMessages: {
        errors: '',
      },
    });
  });
};

exports.postClients = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return req.user.populate('clients').then((response) => {
      res.render('clients/index.ejs', {
        clients: response.clients.sort(),
        path: '/clients',
        page: 'Clienti',
        returnMessages: {
          errors: errors.array()[0].msg,
        },
      });
    });
  }

  req.user
    .addClient(req.body)
    .then((response) => {
      res.redirect('/clients');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getClient = (req, res, next) => {
  const { clientId } = req.params;
  const { edit } = req.query;
  const { deleteOrder } = req.query;
  const { editClient } = req.query;
  const { removeClient } = req.query;

  req.user.populate('clients').then((response) => {
    const foundClient = response.clients.find(
      (cl) => cl._id.toString() === clientId.toString()
    );
    const statement = foundClient.statement;
    const foundOrder = statement.find(
      (item) => item._id.toString() === req.params.orderId?.toString()
    );
    let clientPricing;
    if (foundClient.measurementUnit === 'characters')
      clientPricing = (rate, count) => ((rate * count) / 2000).toFixed(2);
    if (foundClient.measurementUnit === 'words')
      clientPricing = (rate, count) => ((rate * count) / 300).toFixed(2);
    if (
      foundClient.measurementUnit === 'word' ||
      foundClient.measurementUnit === 'page'
    )
      clientPricing = (rate, count) => (rate * count).toFixed(2);

    res.render('clients/client.ejs', {
      foundClient,
      clientStatement: statement.sort((a, b) =>
        a.deliveredDate > b.deliveredDate ? -1 : 1
      ),
      foundOrder,
      clientPricing,
      edit,
      deleteOrder,
      editClient,
      removeClient,
      path: '/clients/:clientId',
      page: 'Client',
    });
  });
};

exports.postClient = (req, res, next) => {
  const { count, rate, notes } = req.body;
  const { clientId } = req.params;
  const { orderId } = req.params;
  const { deleteOrder } = req.query;
  const { editClient } = req.query;
  const { removeClient } = req.query;

  if (deleteOrder) {
    req.user
      .removeStatementOrder(clientId, orderId)
      .then((response) => {
        res.redirect(`/clients/${clientId}`);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else if (editClient) {
    req.user
      .editClient(req.body)
      .then((response) => {
        res.redirect(`/clients/${clientId}`);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else if (removeClient) {
    req.user
      .removeClient(clientId)
      .then((response) => {
        res.redirect(`/clients`);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else {
    req.user
      .editStatementOrder(clientId, orderId, { count, rate, notes })
      .then((response) => {
        res.redirect(`/clients/${clientId}`);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

exports.getStatement = (req, res, next) => {
  const { clientId } = req.params;
  const client = req.user.clients.find(
    (item) => item._id.toString() === clientId
  );
  const fileName = client.name + '-statement' + '.pdf';
  const filePath = path.join('data', 'statements', fileName);

  const newPDF = new PDFConstructor();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; fileName="' + fileName + '"');
  newPDF.pipe(fs.createWriteStream(filePath));
  newPDF.pipe(res);

  newPDF
    .fontSize(14)
    .text(`Situatie ${client.name} la ${new Date().toLocaleString()}`);
  newPDF.text('------------------------------');
  client.statement.forEach((item) => {
    newPDF
      .fontSize(8)
      .text(
        `Primit ${item.receivedDate.toLocaleString()} Livrat ${item.deliveredDate.toLocaleString()} Volum ${
          item.count
        } x Tarif ${item.rate} Total ${(item.count / 2000) * item.rate} ${
          client.currency
        }`
      );
  });

  newPDF.end();

  //////////////
  // const file = fs.createReadStream(filePath);
  // file.pipe(res);
};
