import { types } from "cassandra-driver";
import client from "../models/cassandra";
import { hitWebhook } from "./webhook";

const Long = types.Long;

export const consume = async (msg: any) => {
  const aadhaarIDLong = Long.fromNumber(parseInt(msg.aadhaarID as string));

  const userDetails = await client.execute(
    "SELECT addr FROM sih.users WHERE aadhaar = ?",
    [aadhaarIDLong]
  );

  const address = userDetails.rows[0].addr;

  for (const serviceProvider of msg.serviceProviders) {
    const spDetails = await client.execute(
      "SELECT * FROM sih.sp WHERE id = ?",
      [serviceProvider]
    );
    if (spDetails.rows.length === 0) {
      continue;
    }
    const pushNotificationDetails = JSON.parse(
      spDetails.rows[0].push_notification_details ?? ""
    );
    if (pushNotificationDetails?.webhook_url) {
      await hitWebhook(pushNotificationDetails.webhook_url, {
        aadhaarID: msg.aadhaarID,
        newAddress: address,
      });
    }
  }
};
