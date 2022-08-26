import fetch from "node-fetch";
import client from "../models/cassandra";

export const hitWebhook = async (url: string, body: any, token: string) => {
  try {
    console.log("Hitting webhook");
    const req = JSON.stringify({
      body,
      url,
      token,
    });
    await client.execute("INSERT INTO sih.log (req, ts) VALUES (?, ?)", [
      req,
      new Date(),
    ]);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": token,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.log(err);
  }
};
