const express = require("express");
const blog = express.Router();
const controller = require("../controllers/blogControllers");

blog.get("/", controller.index);
blog.get("/:id", controller.show);
blog.delete("/:id", controller.destroy);

module.exports = blog;
