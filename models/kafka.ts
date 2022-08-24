import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "sih",
  brokers: ["localhost:9092"],
});

export const registerConsumer = async (
  topic: string,
  groupId: string,
  callback: (message: any) => void
) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      callback(JSON.parse(message.value?.toString() ?? ""));
    },
  });
};
