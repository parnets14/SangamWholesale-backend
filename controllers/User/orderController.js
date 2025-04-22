const Cart = require("../../models/User/cartModel");
const Order = require("../../models/User/orderModel");
const Wallet = require("../../models/User/walletModel");
const Product = require("../../models/Admin/productModel");
const Address = require("../../models/User/addressModel");
const mongoose = require("mongoose");

// Place order using wallet balance
const confirmOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethod = "cod", addressId } = req.body;
    const userId = req.user._id;

    // 1. Validate address exists and belongs to user
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);

    if (!address) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Address not found or does not belong to you",
      });
    }

    // 2. Get user's cart with proper error handling
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "name price stock",
        model: "Product",
      })
      .session(session);

    if (!cart) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "No cart found for this user",
      });
    }

    if (!cart.items || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Your cart is empty",
      });
    }

    // 3. Validate all cart items
    const invalidItems = cart.items.filter((item) => !item.product);
    if (invalidItems.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Some products in your cart are no longer available",
        invalidItems: invalidItems.map((item) => item._id),
      });
    }

    // 4. Calculate total and validate stock
    let totalAmount = 0;
    const outOfStockItems = [];

    for (const item of cart.items) {
      const availableStock = item.product.stock;
      const requestedQty = item.quantity;

      if (availableStock < requestedQty) {
        outOfStockItems.push({
          product: item.product._id,
          name: item.product.name,
          available: availableStock,
          requested: requestedQty,
        });
      }

      totalAmount += item.product.price * item.quantity;
    }

    if (outOfStockItems.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Some items are out of stock",
        outOfStockItems,
      });
    }

    // 5. Handle wallet payment
    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: "Wallet not found",
        });
      }

      if (wallet.balance < totalAmount) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: "Insufficient wallet balance",
          balance: wallet.balance,
          required: totalAmount,
        });
      }

      wallet.balance -= totalAmount;
      wallet.transactions.push({
        amount: totalAmount,
        type: "debit",
        description: `Payment for order`,
        metadata: {
          orderTotal: totalAmount,
        },
      });
      await wallet.save({ session });
    }

    // 6. Create the order
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      productType: item.productType,
      ...(item.productType === "subscription" && {
        frequency: item.frequency,
        startDate: item.startDate,
        endDate: item.endDate,
      }),
    }));

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      address: addressId,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
      orderStatus: "processing",
    });

    await order.save({ session });

    // 7. Update product stock
    const bulkOps = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOps, { session });

    // 8. Clear the cart
    await Cart.findByIdAndDelete(cart._id).session(session);

    await session.commitTransaction();

    // 9. Return the complete order details
    const populatedOrder = await Order.findById(order._id)
      .populate("items.product")
      .populate("address");

    res.status(201).json({
      success: true,
      message: "Order confirmed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Order confirmation failed:", error);
    res.status(500).json({
      success: false,
      error: "Order confirmation failed",
      systemError:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .populate("address")
      .sort("-createdAt");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  confirmOrder,
  getUserOrders,
};
