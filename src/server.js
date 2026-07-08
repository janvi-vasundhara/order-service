require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/database");

const { connectRabbitMQ } = require("./config/rabbitmq");

const PORT = process.env.PORT || 5003;

const startServer = async () => {

    try {

        await connectDB();

        await connectRabbitMQ();

        app.listen(PORT, () => {
            console.log(`Order Service running on ${PORT}`);
        });

    } catch (error) {

        console.log(error);

    }

};

startServer();