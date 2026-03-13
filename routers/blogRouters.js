const express = require("express");
const blog = express.Router();
const controller = require("../controllers/blogControllers");

blog.get("/", controller.index);

module.exports = blog;
