const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fname: {
      type: String,
    },
    lname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: Buffer,
      required: true,
    },
    usertype: {
      type: String,
      required: true,
      enum: ["buyer", "seller"],
    },
    addresses: {
      type: [Schema.Types.Mixed],
    },
    // for addresses, we can make a separate Schema like orders. but in this case we are fine

    is_Active: {
      type: Boolean,
      default: true,
    },
    wallet_balance: {
      type: Number,
      default: 0,
    },
    salt: Buffer,
    resetPasswordToken: { type: String, default: "" },
  },
  { timestamps: true }
);

const virtual = userSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.User = mongoose.model("User", userSchema);
