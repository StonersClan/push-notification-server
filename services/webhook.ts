import fetch from "node-fetch";

export const hitWebhook = async (url: string, body: any) => {
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.log(err);
  }
};
