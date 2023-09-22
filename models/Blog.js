const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  motive: String,
  sport: String,
  location: String,
  pop: Number,
  image: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [{ comment: String, user: Object }],
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = mongoose.model("Blog", blogSchema);
