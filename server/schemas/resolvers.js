const { User } = require ('../models');

const resolvers = {
  Query: {
    users: async () => {
      return User.find({}).populate('savedBooks');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('savedBooks')
    }
  },
}