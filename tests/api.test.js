const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");

const api = supertest(app);

const Blog = require("../models/Blog");

beforeEach(async () => {
  {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  }
});

test("blog get req returns correct amount of blogs", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});
test("unique identifier is named id", async () => {
  const response = await api.get("/api/blogs");
  response.body.forEach((blog) => expect(blog.id).toBeDefined());
});
test("blogs can be created", async () => {
  const newBlog = {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    url: "https://www.goodreads.com/book/show/33.The_Lord_of_the_Rings",
    likes: 3275,
  };
  await api.post("/api/blogs").send(newBlog);
  const finalBlogs = await Blog.find({});
  const finalBlogsJSON = finalBlogs.map((note) => note.toJSON());
  const titles = finalBlogsJSON.map((blog) => blog.title);
  expect(finalBlogsJSON).toHaveLength(helper.initialBlogs.length + 1);
  expect(titles).toContain("The Lord of the Rings");
});
test("like property is present", async () => {
  const newBlog = {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    url: "https://www.goodreads.com/book/show/33.The_Lord_of_the_Rings",
  };
  await api.post("/api/blogs").send(newBlog);
  const finalBlogs = await Blog.find({});
  const finalBlogsJSON = finalBlogs.map((blog) => blog.toJSON());
  finalBlogsJSON.forEach((blog) => {
    if (!blog.likes) {
      blog.likes = 0;
    }
  });
  console.log(finalBlogsJSON);
  expect(finalBlogsJSON[0].likes).toBe(42);
  expect(finalBlogsJSON[finalBlogsJSON.length - 1].likes).toBe(0);
});
test("responds with code 400 if title or url is missing", async () => {
  const newBlog = {
    title: "The Lord of the Rings",
    author: "J.R.R Tolkien",
  };
  const request = await api.post("/api/blogs").send(newBlog);
  if (!request.body.url || !request.body.title) {
    expect(request.statusCode).toBe(400);
  }
});
test("responds with 201 and deletes blog", async () => {
  const newBlog = new Blog({
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    url: "https://www.goodreads.com/book/show/33.The_Lord_of_the_Rings",
  });
  await newBlog.save();
  await api.delete(`/api/blogs/${newBlog.toJSON().id}`).expect(201);
});

test("responds with json and updates blog", async () => {
  const originalBlog = new Blog({
    title: "The Lord of the Fungus ",
    author: "Johnny B Goode",
    url: "https://www.goodreads.com/book/show/33.The_Lord_of_the_Rings",
  });
  await originalBlog.save();
  const updatedBlog = {
    title: "The Lord of the Chungus",
    author: "JJ Thompson",
    url: "https://www.goodreads.com/book/show/33.The_Lord_of_the_Rings",
  };
  await api.put(`/api/blogs/${originalBlog.toJSON().id}`).send(updatedBlog);
  const finalBlog = await Blog.findById(originalBlog.toJSON().id);
  console.log(finalBlog);
  expect(finalBlog.title).toBe(updatedBlog.title);
});
afterAll(async () => {
  await mongoose.connection.close();
});
