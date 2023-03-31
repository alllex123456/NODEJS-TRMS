const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  legalName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  companyRegistration: {
    type: String,
    required: false,
  },
  taxNumber: {
    type: String,
    required: false,
  },
  registeredOffice: {
    type: String,
    required: false,
  },

  orders: [
    {
      clientId: { type: Schema.Types.ObjectId, required: true },
      clientName: { type: String, required: false },
      count: {
        type: Number,
        required: true,
      },
      rate: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      receivedDate: {
        type: Date,
        required: true,
      },
      deadline: {
        type: Date,
        required: true,
      },
      notes: {
        type: String,
        required: false,
      },
    },
  ],

  clients: [
    {
      name: { type: String, required: true },
      rate: { type: Number, required: true },
      measurementUnit: { type: String, required: true },
      currency: { type: String, required: true },
      taxNumber: { type: String, required: false },
      registrationNumber: { type: String, required: false },
      registeredOffice: { type: String, required: false },
      phone: { type: Number, required: false },
      email: { type: String, required: false },
      bankAccount: { type: String, required: false },
      bankName: { type: String, required: false },
      notes: { type: String, required: false },
      statement: [
        {
          count: {
            type: Number,
            required: true,
          },
          rate: {
            type: Number,
            required: true,
          },
          receivedDate: {
            type: Date,
            required: true,
          },
          deliveredDate: {
            type: Date,
            required: true,
          },
          deadline: {
            type: Date,
            required: true,
          },
          notes: {
            type: String,
            required: false,
          },
        },
      ],
    },
  ],

  statistics: {
    day: { type: Date, required: false },
    RON: {
      todayCount: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
      todayValue: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
    },
    EUR: {
      todayCount: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
      todayValue: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
    },
    USD: {
      todayCount: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
      todayValue: {
        characters: { type: Number, required: false },
        words: { type: Number, required: false },
        page: { type: Number, required: false },
        word: { type: Number, required: false },
      },
    },
  },
});

userSchema.methods.editUser = function (user, file) {
  this.email = user.email;
  this.name = user.name;
  this.legalName = user.legalName;
  this.registeredOffice = user.registeredOffice;
  this.taxNumber = user.taxNumber;
  this.companyRegistration = user.companyRegistration;
  if (file) this.image = file.path;

  return this.save();
};

userSchema.methods.addOrder = function (order) {
  const client = this.clients.find(
    (cl) => cl._id.toString() === order.clientId.toString()
  );

  const editedOrderIndex = this.orders.findIndex(
    (o) => o._id.toString() === order.orderId?.toString()
  );

  if (editedOrderIndex !== -1) {
    this.orders[editedOrderIndex] = {
      _id: this.orders[editedOrderIndex],
      clientId: order.clientId,
      clientName: client.name,
      count: order.count,
      rate: order.rate,
      currency: this.orders[editedOrderIndex].currency,
      receivedDate: this.orders[editedOrderIndex].receivedDate,
      deadline: order.deadline,
      notes: order.notes,
    };
  } else {
    this.orders.push({
      clientId: order.clientId,
      clientName: client.name,
      count: order.count,
      rate: order.rate,
      currency: order.currency,
      receivedDate: new Date(),
      deadline: order.deadline,
      notes: order.notes,
    });
  }

  return this.save();
};

userSchema.methods.addClient = function (client) {
  this.clients.push({
    name: client.name.toUpperCase(),
    rate: client.rate,
    measurementUnit: client.measurementUnit,
    currency: client.currency,
    taxNumber: client.taxNumber,
    registrationNumber: client.registrationNumber,
    registeredOffice: client.registeredOffice,
    phone: client.phone,
    email: client.email,
    bankAccount: client.bankAccount,
    bankName: client.bankName,
    notes: client.notes,
    statement: [],
  });
  return this.save();
};

userSchema.methods.editClient = function (client) {
  const editedClientIndex = this.clients.findIndex(
    (item) => item._id.toString() === client.clientId.toString()
  );
  this.clients[editedClientIndex] = {
    _id: this.clients[editedClientIndex]._id,
    name: client.name.toUpperCase(),
    rate: client.rate,
    measurementUnit: client.measurementUnit,
    currency: client.currency,
    taxNumber: client.taxNumber,
    registrationNumber: client.registrationNumber,
    registeredOffice: client.registeredOffice,
    phone: client.phone,
    email: client.email,
    bankAccount: client.bankAccount,
    bankName: client.bankName,
    notes: client.notes,
    statement: this.clients[editedClientIndex].statement,
  };
  return this.save();
};

userSchema.methods.removeClient = function (clientId) {
  this.clients = this.clients.filter(
    (item) => item._id.toString() !== clientId.toString()
  );
  return this.save();
};

userSchema.methods.addToStatements = function (order) {
  const client = this.clients.find(
    (item) => item._id.toString() === order.clientId.toString()
  );

  let orderCurrency = order.currency;

  let charactersCount, pagesCount, wordsCount, wordCount;

  if (client.measurementUnit === 'words') {
    wordsCount = +order.count;
  } else if (client.measurementUnit === 'characters') {
    charactersCount = +order.count;
  } else if (client.measurementUnit === 'page') {
    pagesCount = +order.count;
  } else if (client.measurementUnit === 'word') {
    wordCount = +order.count;
  }

  let computedCharactersValue,
    computedWordsValue,
    computedWordValue,
    computedPagesValue;

  if (client.measurementUnit === 'words') {
    computedWordsValue = (+order.count * +order.rate) / 300;
  } else if (client.measurementUnit === 'characters') {
    computedCharactersValue = (+order.count * +order.rate) / 2000;
  } else if (client.measurementUnit === 'page') {
    computedPagesValue = +order.count * +order.rate;
  } else if (client.measurementUnit === 'word') {
    computedWordValue = +order.count * +order.rate;
  }

  if (
    this.statistics.day &&
    this.statistics.day.getDate() === new Date().getDate()
  ) {
    this.statistics.day = order.deliveredDate;
    this.statistics[`${orderCurrency}`] = {
      todayCount: {
        characters: this.statistics[`${orderCurrency}`].todayCount.characters
          ? +this.statistics[`${orderCurrency}`].todayCount.characters +
            (charactersCount || 0)
          : charactersCount || 0,
        page: this.statistics[`${orderCurrency}`].todayCount.page
          ? +this.statistics[`${orderCurrency}`].todayCount.page +
            (pagesCount || 0)
          : pagesCount || 0,
        words: this.statistics[`${orderCurrency}`].todayCount.words
          ? +this.statistics[`${orderCurrency}`].todayCount.words +
            (wordsCount || 0)
          : wordsCount || 0,
        word: this.statistics[`${orderCurrency}`].todayCount.word
          ? +this.statistics[`${orderCurrency}`].todayCount.word +
            (wordCount || 0)
          : wordCount || 0,
      },
      todayValue: {
        characters: this.statistics[`${orderCurrency}`].todayValue.characters
          ? +this.statistics[`${orderCurrency}`].todayValue.characters +
            (computedCharactersValue || 0)
          : computedCharactersValue || 0,
        words: this.statistics[`${orderCurrency}`].todayValue.words
          ? +this.statistics[`${orderCurrency}`].todayValue.words +
            (computedWordsValue || 0)
          : computedWordsValue || 0,
        page: this.statistics[`${orderCurrency}`].todayValue.page
          ? +this.statistics[`${orderCurrency}`].todayValue.page +
            (computedPagesValue || 0)
          : computedPagesValue || 0,
        word: this.statistics[`${orderCurrency}`].todayValue.word
          ? +this.statistics[`${orderCurrency}`].todayValue.word +
            (computedWordValue || 0)
          : computedWordValue || 0,
      },
    };
  } else {
    this.statistics.day = order.deliveredDate;
    this.statistics[`${orderCurrency}`] = {
      todayCount: {
        characters: charactersCount || 0,
        words: wordsCount || 0,
        page: pagesCount || 0,
        word: wordCount || 0,
      },
      todayValue: {
        characters: computedCharactersValue || 0,
        words: computedWordsValue || 0,
        page: computedPagesValue || 0,
        word: computedWordValue || 0,
      },
    };
  }

  client.statement.push({
    count: order.count,
    rate: order.rate,
    receivedDate: order.receivedDate,
    deadline: order.deadline,
    deliveredDate: order.deliveredDate,
    notes: order.notes,
  });
  // this.orders = this.orders.filter(
  //   (item) => item._id.toString() !== order.orderId.toString()
  // );

  return this.save();
};

userSchema.methods.findClient = function (id) {
  return this.clients.find((client) => client._id.toString() === id.toString());
};

userSchema.methods.removeOrder = function (id) {
  this.orders = this.orders.filter(
    (item) => item._id.toString() !== id.toString()
  );
  return this.save();
};

userSchema.methods.editStatementOrder = function (
  clientId,
  orderId,
  editedData
) {
  const client = this.clients.find(
    (item) => item._id.toString() === clientId.toString()
  );
  const editedOrderIndex = client.statement.findIndex(
    (item) => item._id.toString() === orderId.toString()
  );
  const order = client.statement.find(
    (item) => item._id.toString() === orderId.toString()
  );

  client.statement[editedOrderIndex] = {
    _id: order._id,
    receivedDate: order.receivedDate,
    deliveredDate: order.deliveredDate,
    deadline: order.deadline,
    count: editedData.count || order.count,
    rate: editedData.rate || order.rate,
    notes: editedData.notes || order.notes,
  };
  return this.save();
};

userSchema.methods.removeStatementOrder = function (clientId, orderId) {
  const client = this.clients.find(
    (item) => item._id.toString() === clientId.toString()
  );
  client.statement = client.statement.filter(
    (item) => item._id.toString() !== orderId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
