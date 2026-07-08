const mongoose = require("mongoose");

const Order = require("../models/order.model");
const { getProductById } = require("./product.service");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createOrder = async ({ userId, productId, quantity }) => {
  if (!productId || !quantity) {
    const error = new Error("productId and quantity are required");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidObjectId(productId)) {
    const error = new Error("Invalid product ID");
    error.statusCode = 400;
    throw error;
  }

  if (typeof quantity !== "number" || quantity < 1) {
    const error = new Error("Quantity must be a positive number");
    error.statusCode = 400;
    throw error;
  }

  const product = await getProductById(productId);

  if (product.stock < quantity) {
    const error = new Error("Insufficient stock available");
    error.statusCode = 400;
    throw error;
  }

  const totalPrice = product.price * quantity;

  const order = await Order.create({
    userId,
    productId,
    quantity,
    totalPrice,
    status: "Pending",
  });

  return order;
};

const getOrdersByUserId = async (userId) => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId) => {
  if (!isValidObjectId(orderId)) {
    const error = new Error("Invalid order ID");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  getOrderById,
};
