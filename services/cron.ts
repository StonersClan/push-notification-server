import schedule from "node-schedule";
import { types } from "cassandra-driver";
import { pushMsgToQueue } from "../models/kafka";
const Long = types.Long;

export const scheduleTask = (task: () => void, time: Date) => {
  schedule.scheduleJob(time, task);
};

export const addToQueue = (
  serviceProviderID: string,
  aadhaarID: Long.Long,
  time: Date
) => {
  scheduleTask(() => {
    pushMsgToQueue({
      serviceProviders: [serviceProviderID],
      aadhaarID,
    });
  }, time);
};
