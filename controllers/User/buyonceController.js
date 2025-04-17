const Cart = require("../../models/User/buyonceModel");
const Product = require("../../models/Admin/productModel");
const Address = require("../../models/User/addressModel");

// Create or get user's cart
exports.getOrCreateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .populate("shippingAddress");

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0,
        discountTotal: 0,
        deliveryFee: 0,
        grandTotal: 0,
        offers: [],
      });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        purchaseType: "Buy Once",
      });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product")
      .populate("shippingAddress");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product")
      .populate("shippingAddress");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product")
      .populate("shippingAddress");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update shipping address
exports.updateShippingAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { shippingAddress: addressId },
      { new: true }
    )
      .populate("items.product")
      .populate("shippingAddress");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply coupon to cart
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { couponCode, discount } = req.body;

    // In a real app, you would validate the coupon code against a database
    // Here we're just accepting the discount value directly for simplicity

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if coupon already applied
    const existingCouponIndex = cart.offers.findIndex(
      (offer) => offer.code === couponCode
    );

    if (existingCouponIndex >= 0) {
      cart.offers[existingCouponIndex].discount = discount;
    } else {
      cart.offers.push({ code: couponCode, discount });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product")
      .populate("shippingAddress");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove coupon from cart
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { couponCode } = req.params;

    // Validate coupon code
    if (!couponCode || typeof couponCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    // Check if cart exists
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Check if coupon exists in cart
    const couponIndex = cart.offers.findIndex(
      (offer) => offer.code === couponCode
    );

    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found in cart",
      });
    }

    // Remove the coupon
    cart.offers.splice(couponIndex, 1);

    // Save the cart (this will trigger the pre-save hook to recalculate totals)
    await cart.save();

    // Return the updated cart with populated fields
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product")
      .populate("shippingAddress");

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: [],
        subtotal: 0,
        discountTotal: 0,
        deliveryFee: 0,
        grandTotal: 0,
        offers: [],
        shippingAddress: null,
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
