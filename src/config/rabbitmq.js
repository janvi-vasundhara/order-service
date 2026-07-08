const amqp = require("amqplib");

let channel;

const QUEUE_NAME = "order_created";

const connectRabbitMQ = async () => {
    try {

        const connection = await amqp.connect(process.env.RABBITMQ_URL);

        channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, {
            durable: true,
        });

        console.log("✅ Order Service Connected to RabbitMQ");

    } catch (error) {
        console.log(error);
    }
};

const getChannel = () => channel;

module.exports = {
    connectRabbitMQ,
    getChannel,
    QUEUE_NAME,
};