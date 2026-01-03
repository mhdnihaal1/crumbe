const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
      userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
         },
 items: [
      {
        productId: Number,
        product: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    discountApplied: {
      type: Boolean,
      default: false,
    },
    TotalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },
    orderStatus: {
      type: String,
      enum: ["ORDER PLACED", "DELIVERED", "CANCELLED"],
      default: "ORDER PLACED",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
