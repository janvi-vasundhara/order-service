const orderService = require("../services/order.service");
const { getChannel, QUEUE_NAME } = require("../config/rabbitmq");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const order = await orderService.createOrder({
      userId,
      productId,
      quantity,
    });

    const channel = getChannel();

    const orderEvent = {
      orderId: order._id,
      userId: order.userId,
      userEmail: req.user.email,
      productId: order.productId,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(orderEvent)), {
      persistent: true,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUserId(userId);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await orderService.getOrderById(id, userId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};
