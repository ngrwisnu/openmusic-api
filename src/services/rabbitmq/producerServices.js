import amqp from "amqplib";
import config from "../../config/env.js";

const ProducerServices = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMq.rabbitmqServer);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 3000);
  },
};

export default ProducerServices;
