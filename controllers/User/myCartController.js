const Cart = require("../../models/User/myCartModle");

exports.getCart = async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  res.json({ success: true, cart: cart ? cart.items : [] });
};

exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });
  const idx = cart.items.findIndex((item) => item.product.equals(productId));
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  res.json({ success: true, cart: cart.items });
};

exports.updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: userId });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });
  const item = cart.items.find((item) => item.product.equals(productId));
  if (!item)
    return res.status(404).json({ success: false, message: "Item not found" });
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, cart: cart.items });
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: userId });
  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found" });
  cart.items = cart.items.filter((item) => !item.product.equals(productId));
  await cart.save();
  res.json({ success: true, cart: cart.items });
};

exports.clearCart = async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ success: true, cart: [] });
};
