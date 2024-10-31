import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
