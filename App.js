const express = require("express");
const app = express();
const port = 3000;
const blogRouter = require("./routers/blogRouters");
const error = require("./middlewares/errorHandler");

app.use(express.json());
app.use("/blog", blogRouter);

app.use(error.notFound);
app.use(error.internal);
app.listen(port, () => {
  console.log("In ascolto");
});
