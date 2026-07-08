const axios = require("axios");

const productClient = axios.create({
  baseURL: process.env.PRODUCT_SERVICE_URL,
  timeout: 5000,
});

const getProductById = async (productId) => {
  try {
    const response = await productClient.get(`/api/products/${productId}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const notFoundError = new Error("Product not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    if (error.response) {
      const serviceError = new Error("Failed to fetch product from Product Service");
      serviceError.statusCode = error.response.status;
      throw serviceError;
    }

    const unavailableError = new Error("Product Service is unavailable");
    unavailableError.statusCode = 503;
    throw unavailableError;
  }
};

/*
 * Stock should be decremented via the Product Service API, e.g.:
 *   PATCH /api/products/:id/stock  { "quantity": -2 }
 *
 * Do NOT update the Product Service database from the Order Service.
 * In a later phase, this will be improved with RabbitMQ / event-driven
 * communication (order.created → product-service reduces stock).
 */
const updateProductStock = async (productId, quantityChange, authToken) => {
  await productClient.patch(
    `/api/products/${productId}/stock`,
    { quantity: quantityChange },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
};

module.exports = {
  getProductById,
  updateProductStock,
};
