import fetch from "node-fetch";

export const hitWebhook = async (url: string, body: any, token: string) => {
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": token
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.log(err);
  }
};
