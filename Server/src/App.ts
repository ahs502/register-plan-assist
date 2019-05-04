import * as express from "express";

const app = express();

import userRouter from "./User";
app.use("/user", userRouter);

export default app;
