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

function show(req, res) {
  const id = req.params.id;
  const sql = "select * from posts where id=?";

  connection.query(sql, [id], (err, resultsBlog) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    if (resultsBlog.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Id not found",
      });
    }
    res.json({
      success: true,
      results: resultsBlog[0],
    });
  });
}

function destroy(req, res) {
  const id = req.params.id;
  const sql = "delete from posts where id=?";

  connection.query(sql, [id], (err, resultsDel) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });

    if (resultsDel.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Id not found",
      });
    }

    res.status(204);
  });
}

module.exports = { index, show, destroy };
