const express = require("express");
const blog = express.Router();
const controller = require("../controllers/blogControllers");

blog.get("/", controller.index);
blog.delete("/:id", controller.destroy);

module.exports = blog;
