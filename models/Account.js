const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Account = db.define('Account', {
  accountNumber: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isUnique: function(value, next) {
        Account.findOne({
          where: { email: value },
          attributes: ['id']
        })
          .then(user => {
            if (user) {
              return next('Email address already in use!');
            } else next();
          })
          .catch(err => console.log(err));
      }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: 6,
        msg: 'Password should be atleast 6 characters'
      }
    }
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  balance: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  currency: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Hash password
Account.beforeSave(async function(Account) {
  const salt = await bcrypt.genSalt(10);

  Account.password = await bcrypt.hash(Account.password, salt);
});

// Sign JWT
Account.prototype.signJWT = function() {
  return jwt.sign(
    { accountNumber: this.accountNumber },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

module.exports = Account;
