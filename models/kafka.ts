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

const producer = kafka.producer();

export const pushMsgToQueue = async (msg: any) => {
  await producer.connect();
  await producer.send({
    topic: "quickstart",
    messages: [
      {
        value: JSON.stringify(msg),
      },
    ],
  });
  await producer.disconnect();
};
