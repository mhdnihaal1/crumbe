const express = require("express");
const path = require("path");

const cors = require("cors");
const Cart = require("./model/cart");
const Order = require("./model/order");
const Product = require("./model/product");
const User = require("./model/user.js");
const connectDB = require("./config/db");

const app = express();

connectDB();

/* ================= Middleware ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors()); // allow frontend access
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true }));

//

app.post("/createUserORlogin", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findOne({ name });

    if (!user) {
      const user = await User.create({ name });
      console.log("1 New user created:", user);
      return res.status(201).json({ message: "New user is created", user });
    }

    res.status(201).json({
      message: "Existing User login successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/getCart", async (req, res) => {
  try {
    const { userId } = req.query;
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({
      message: "Cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/editCart", async (req, res) => {
  try {
    const { user, itemId, action } = req.body;
    let userId = user._id;
    console.log(userId, itemId, action);

    if (!userId || !itemId || !action) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

     if (action === "increase") {
      cart.items[itemIndex].quantity += 1;
    }

    if (action === "decrease") {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      }
    }

     cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/addCart", async (req, res) => {
  try {
    const { user, productId, product, price } = req.body;
    if (!productId || !product || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let userId = user._id;
    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [
          {
            productId,
            product,
            price,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId == productId
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({
          productId,
          product,
          price,
        });
      }
    }
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/addOrder", async (req, res) => {
  try {
    const { user, discountApplied, TotalAmount } = req.body;
     if (!user || !TotalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let userId = user._id;
     const cart = await Cart.findOne({ userId: userId });
 
    const items = cart.items.map((item) => ({
      productId: item.productId,
      product: item.product,
      price: item.price,
      quantity: item.quantity,
    }));
 
    const order = await Order.create({
      userId,
      items,
      discountApplied,
      TotalAmount,
    });
     cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET user orders
app.get("/getOrders", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
