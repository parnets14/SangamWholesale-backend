const Buyonce = require('../../models/User/buyonceModel');
const Subscription = require('../../models/User/subscriptionModel');


// Get user's combined cart (existing orders + subscriptions)
const getCombinedCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all buyonce orders
    const buyonceOrders = await Buyonce.find({ user: userId })
      .populate({
        path: 'order.productId',
        select: 'name price images'
      })
      .populate('order.address');

    // Get all subscriptions
    const subscriptions = await Subscription.find({ user: userId })
      .populate({
        path: 'Subscriptions.product',
        select: 'name price images'
      })
      .populate('Subscriptions.address');

    // Transform data into cart-like format
    const cartItems = [];
    
    // Process buyonce orders
    buyonceOrders.forEach(order => {
      order.order.forEach(item => {
        cartItems.push({
          type: 'buyonce',
          id: item._id,
          product: item.productId,
          quantity: item.quantity,
          status: item.status,
          deliveryDate: item.deliveryDate,
          address: item.address,
          createdAt: order.createdAt
        });
      });
    });

    // Process subscriptions
    subscriptions.forEach(sub => {
      sub.Subscriptions.forEach(item => {
        cartItems.push({
          type: 'subscription',
          id: item._id,
          product: item.product,
          quantity: item.quantity,
          status: item.status,
          frequency: item.frequency,
          startDate: item.startDate,
          endDate: item.endDate,
          address: item.address,
          createdAt: sub.createdAt
        });
      });
    });

    // Sort by creation date (newest first)
    cartItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: cartItems.length,
      items: cartItems
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Helper function to find order by item ID
const findOrderByItemId = async (userId, itemId) => {
  // Check in BuyOnce orders
  let buyonceOrder = await Buyonce.findOne({
    user: userId,
    'order._id': itemId
  });

  if (buyonceOrder) {
    return {
      type: 'buyonce',
      order: buyonceOrder,
      item: buyonceOrder.order.id(itemId)
    };
  }

  // Check in Subscriptions
  let subscription = await Subscription.findOne({
    user: userId,
    'Subscriptions._id': itemId
  });

  if (subscription) {
    return {
      type: 'subscription',
      order: subscription,
      item: subscription.Subscriptions.id(itemId)
    };
  }

  return null;
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    // Find the order containing this item
    const orderInfo = await findOrderByItemId(userId, itemId);
    if (!orderInfo) {
      return res.status(404).json({ error: 'Item not found in your orders' });
    }

    // Apply updates
    if (updates.quantity !== undefined) {
      orderInfo.item.quantity = updates.quantity;
    }

    if (updates.address) {
      const address = await Address.findOne({
        _id: updates.address,
        user: userId
      });
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      orderInfo.item.address = updates.address;
    }

    // For subscriptions - update frequency/dates
    if (orderInfo.type === 'subscription') {
      if (updates.frequency) {
        orderInfo.item.frequency = updates.frequency;
      }
      if (updates.startDate) {
        orderInfo.item.startDate = updates.startDate;
      }
      if (updates.endDate) {
        orderInfo.item.endDate = updates.endDate;
      }
    }

    await orderInfo.order.save();
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: orderInfo.item
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove item from cart/orders
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    // Try to remove from BuyOnce orders
    const buyonceUpdate = await Buyonce.findOneAndUpdate(
      {
        user: userId,
        'order._id': itemId
      },
      {
        $pull: { order: { _id: itemId } }
      },
      { new: true }
    );

    if (buyonceUpdate) {
      // If no more items in the order, delete it
      if (buyonceUpdate.order.length === 0) {
        await Buyonce.findByIdAndDelete(buyonceUpdate._id);
      }
      return res.status(200).json({ 
        success: true,
        message: 'BuyOnce item removed successfully' 
      });
    }

    // Try to remove from Subscriptions
    const subscriptionUpdate = await Subscription.findOneAndUpdate(
      {
        user: userId,
        'Subscriptions._id': itemId
      },
      {
        $pull: { Subscriptions: { _id: itemId } }
      },
      { new: true }
    );

    if (subscriptionUpdate) {
      // If no more items in the subscription, delete it
      if (subscriptionUpdate.Subscriptions.length === 0) {
        await Subscription.findByIdAndDelete(subscriptionUpdate._id);
      }
      return res.status(200).json({ 
        success: true,
        message: 'Subscription item removed successfully' 
      });
    }

    res.status(404).json({ error: 'Item not found in your orders' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Apply coupon to orders
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user._id;

    // In a real implementation, you would:
    // 1. Validate the coupon code
    // 2. Calculate discount amount
    // 3. Apply to relevant orders
    
    // This is a simplified version
    const discount = 10; // Example: 10% discount
    
    // For demonstration, we'll just return the discount info
    res.status(200).json({
      success: true,
      message: `Coupon applied: ${couponCode}`,
      discount: {
        percentage: discount,
        code: couponCode
      },
      // In real implementation, you would update orders with discount
      ordersUpdated: [] 
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Clear all orders (use with caution!)
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all BuyOnce orders
    await Buyonce.deleteMany({ user: userId });
    
    // Delete all Subscriptions
    await Subscription.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'All your orders have been cleared',
      deletedCount: {
        buyonce: (await Buyonce.countDocuments({ user: userId })),
        subscriptions: (await Subscription.countDocuments({ user: userId }))
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



module.exports = {
  getCombinedCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart
};