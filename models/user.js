const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    required: true,
    type: String,
  },
  password: String,
  words: [
    {
      wordId: String,
      word: String,
      wordType: String,
      definitions: [String],
      examples: [String],
      sound: String,
      filters: [String],
      history: Date,
    },
  ],
  filters: [String],
  cache: {
    word: String,
    wordTypes: [String],
    results: [],
  },
});

userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 14);
};

userSchema.methods.validPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
