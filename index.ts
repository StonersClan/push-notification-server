import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { registerConsumer } from "./models/kafka";
import { consume } from "./services/consumer";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8081;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

registerConsumer("quickstart", "test", consume);
