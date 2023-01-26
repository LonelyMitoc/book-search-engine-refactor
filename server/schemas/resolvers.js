const { AuthenticationError } = require('apollo-server-express');
const { User } = require ('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // Check if the user is logged in
      if (!context.user)
        throw new AuthenticationError("You must be logged in", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });

      return await User.findById(context.user._id).populate("books");
    },
  },
  
  Mutation: {
    login: async (parent, { email, password }) => {
      // Check if the email exists in the db
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("No user with this email found");
      }
      // If the email exists, check if the password is correct
      const checkPw = await user.isCorrectPassword(password);
      if (!checkPw) {
        throw new AuthenticationError("Incorrect password");
      }
      // The first time the user logs in the server generates a token
      const token = signToken(user);
      // After logging in, the server needs to send the newly generated token
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      // Create a user and generate a token
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      // After log in, server returns the new token
      return { token, user };
    },

    // Save book to user
    saveBook: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("Please Login first.");
      }
      const updateBook = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args.input } },
        { new: true }
      );
      return updateBook;
    },

    // Remove the book if bookId matches arg.bookId
    removeBook: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("Please Login first.");
      }
      const updateBook = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      return updateBook;
    },
  },
};

module.exports = resolvers;