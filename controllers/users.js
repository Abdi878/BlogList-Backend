const User = require("../models/User");
const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
userRouter.post("/", async (request, response) => {
    console.log(request.body)
  const { username, name, password } = request.body;

  if(!username||!password){
    return response.status(400).json({error:"missing username or password"})
  }
  if(username.length<3){
    return response.status(400).json({error:"username length too short"})
  }
  if(password.length<3){
    return response.status(400).json({error:"password length too short"})
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});
userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs",{sport:1,location:1,pop:1});
  response.json(users);
});

module.exports = userRouter;
