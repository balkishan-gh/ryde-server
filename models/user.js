const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // number: {
  //   type: Number,
  //   required: true,
  // },
  // role: {
  //   type: String,
  //   required: true,
  // },
  password: {
    type: String,
    required: true,
  },
  // jwt: {
  //   type: String,
  // },
  // credId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Cred",
  //   required: true,
  // },
});

module.exports = mongoose.model("User", userSchema);
