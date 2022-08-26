import { types } from "cassandra-driver";
import client from "../models/cassandra";
import { randomCodeGenerator } from "../utils";
import { baseDelay, maxDelay } from "../utils/constants";
import status from "../utils/status";
import { addToQueue } from "./cron";
import { hitWebhook } from "./webhook";

const Long = types.Long;

export const consume = async (msg: any) => {
  const aadhaarIDLong = Long.fromNumber(parseInt(msg.aadhaarID as string));

  const userDetails = await client.execute(
    "SELECT addr FROM sih.users WHERE aadhaar = ?",
    [aadhaarIDLong]
  );

  if (userDetails.rows.length === 0) {
    return;
  }
  const address = userDetails.rows[0].addr;

  for (const serviceProvider of msg.serviceProviders) {
    const spDetails = await client.execute(
      "SELECT * FROM sih.sp WHERE id = ?",
      [serviceProvider]
    );
    if (spDetails.rows.length === 0) {
      continue;
    }
    const addrMappingDetails = await client.execute(
      "SELECT * FROM sih.addr_mapping WHERE aadhaar = ? AND sp_id = ?",
      [aadhaarIDLong, serviceProvider]
    );
    if (
      addrMappingDetails.rows.length === 0 ||
      addrMappingDetails.rows[0].status !== status.PENDING
    ) {
      continue;
    }

    let delay = addrMappingDetails.rows[0].last_delay as Long.Long;
    if (delay !== Long.fromNumber(-1)) {
      const date = addrMappingDetails.rows[0].ts as Date;
      date.setTime(date.getTime() + delay.toInt() ?? 0);
      addToQueue(serviceProvider, aadhaarIDLong, date);

      delay = delay.multiply(Long.fromNumber(2));

      if (delay.subtract(maxDelay).toInt() > 0) {
        await client.execute(
          "UPDATE sih.addr_mapping SET status = ?, last_delay = ? WHERE aadhaar = ? AND sp_id = ?",
          [status.DENIED, -1, aadhaarIDLong, serviceProvider]
        );
      } else {
        await client.execute(
          "UPDATE sih.addr_mapping SET ts = ?, last_delay = ? WHERE aadhaar = ? AND sp_id = ?",
          [date, delay, aadhaarIDLong, serviceProvider]
        );
      }
    }
    const pushNotificationDetails = JSON.parse(
      spDetails.rows[0].push_notification_details ?? ""
    );

    const randomCode = randomCodeGenerator(8);
    await client.execute("INSERT INTO sih.sp_auth_codes (code) VALUES (?)", [
      randomCode,
    ]);

    if (pushNotificationDetails?.webhook_url) {
      await hitWebhook(
        pushNotificationDetails.webhook_url,
        {
          aadhaarID: msg.aadhaarID,
          newAddress: address,
        },
        randomCode
      );
    }
  }
};
