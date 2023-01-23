const { User } = require ('../models');

const resolvers = {
  Query: {
    user: async () => {
      return User.find({});
    },
  },
  User: {
    book: async (parent, {_id }) => {
    const params = _id ? {_id } : {};
    return User.savedBook.find(params);
    },
  },
}