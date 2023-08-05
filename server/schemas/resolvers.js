const { AuthenticationError } = require("apollo-server-express");

const { User } = require("../models");

const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You are not logged in!");
      }

      const userData = await User.findOne({ _id: context.user._id }).select(
        "-password"
      );

      return userData;
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Email not recognized!");
      }

      const correctPass = await user.isCorrectPassword(password);

      if (!correctPass) {
        throw new AuthenticationError("Password is incorrect!");
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { user, token };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to log in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        { _id: context.user._id },
        { $push: { savedBooks: bookData } },
        { new: true }
      );

      return updatedUser;
    },
    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to log in!");
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;
