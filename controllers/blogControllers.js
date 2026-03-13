const connection = require("../db/connections");

function index(req, res) {
  const sql = "select * from posts";

  connection.query(sql, (err, resultsBlog) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    res.json({
      success: true,
      results: resultsBlog,
    });
  });
}

module.exports = { index };
