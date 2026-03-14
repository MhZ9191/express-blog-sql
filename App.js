const express = require("express");
const app = express();
const port = 3000;
const blogRouter = require("./routers/blogRouters");

app.use(express.json());
app.use("/blog", blogRouter);

app.listen(port, () => {
  console.log("In ascolto");
});
