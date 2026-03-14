const express = require("express");
const blog = express.Router();
const controller = require("../controllers/blogControllers");
const middle = require("../middlewares/validateMiddle");

blog.get("/", controller.index);
blog.get("/:id", controller.show);
blog.delete("/:id", controller.destroy);
blog.post("/", middle, controller.store);
blog.put("/:id", middle, controller.update);

module.exports = blog;
