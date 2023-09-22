const Blog = require("../models/Blog");
const blogsRouter = require("express").Router();


blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});
blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(blog);
});
blogsRouter.post("/:id/comments", async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id);
    const { comment, user } = request.body;
    const newComment = { comment, user };
    console.log(comment);
    console.log(user);
    console.log(newComment);
    if (!blog.comments) {
      blog.comments = newComment;
    } else {
      blog.comments = blog.comments.concat(newComment);
    }
    await blog.save();
    console.log(blog.comments);
    response.json(blog);
  } catch (error) {
    response.status(500).json({ error: "Failed to update blog comments" });
  }
});
blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  body.user = request.user.id;
  if (!body.pop || !body.sport || !body.location || !body.motive) {
    return response.status(400).json({ error: "Bad Request" });
  }
  const blog = new Blog({ ...body, members: [] });
  await blog.populate("user", { username: 1, name: 1, id: 1 });
  const savedBlog = await blog.save();
  console.log(savedBlog)
  request.user.blogs = request.user.blogs.concat(savedBlog.id);
  await request.user.save();
  console.log(JSON.stringify(savedBlog))
  response.status(201).json(savedBlog);
});
blogsRouter.delete("/:id", async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: "token invalid" });
  }
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(400).json("invalid ID");
  }
  if (blog.user.toString() !== request.user.id) {
    return response.json("invalid user");
  }
  console.log("deleted");
  await Blog.findByIdAndDelete(blog.id);
  response.json(blog).status(201);
});
blogsRouter.put("/:id", async (request, response) => {
  await Blog.findByIdAndUpdate(request.params.id, request.body);
  response.status(200).end();
});
module.exports = blogsRouter;
