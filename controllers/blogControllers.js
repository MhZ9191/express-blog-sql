const connection = require("../db/connections");

function index(req, res) {
  res.json({
    message: "test",
  });
}

module.exports = { index };
