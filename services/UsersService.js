const { User } = require('../models');

const UserService = {
  findUser: async (phone) => User.findOne({ where: { phone_number: phone } }),
};

module.exports = UserService;