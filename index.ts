import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { indexRouter } from "./src/routes/index_router";
import { connectToDatabase } from "./src/config/mongo";
import cors from "cors";
import path from "path";
import { startSocket } from "./src/services/socket/SocketServer";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
const port = process.env.PORT;
app.use("/app/", indexRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
let date = new Date();
app.get("/", (_, res) =>
  res.status(200).send("<h1>🔥 Server is 🆙 🔥</h1></br>" + date)
);
connectToDatabase(console.log, () => {
  app.listen(port, () => {
    console.log(
      `⚡️[rest-api-server ]: Server is running at http://localhost:${port}`
    );
    startSocket(
      app,
      /*onStart=*/ (port) => {
        console.log(
          `⚡️[socket-io-server]: Server is running at http://localhost:${port}`
        );
      }
    );
  });
});
