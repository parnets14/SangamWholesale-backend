const Wishlist = require('../../models/User/wishListModel');

exports.getWishlist = async (req, res) => {
  const userId = req.user._id;
  const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  res.json({ success: true, wishlist: wishlist ? wishlist.products : [] });
};

exports.addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = new Wishlist({ user: userId, products: [] });
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.json({ success: true, wishlist: wishlist.products });
};

exports.removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });
  wishlist.products = wishlist.products.filter(pid => pid.toString() !== productId);
  await wishlist.save();
  res.json({ success: true, wishlist: wishlist.products });
};