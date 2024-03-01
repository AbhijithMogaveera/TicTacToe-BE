import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import { indexRouter } from "./src/routes/index_router";
import { connectToDatabase } from "./src/config/mongo";
import cors from "cors";
import path from "path";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
const port = process.env.PORT;
app.use("/app/",indexRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get("/", (req, res)=>res.status(200).send("🔥 Yo! server is 🆙 => " + new Date()))
connectToDatabase(console.log, ()=>{
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})
