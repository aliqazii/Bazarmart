import ActivityLog from "../models/activityLogModel.js";
import catchAsync from "../middleware/catchAsync.js";

// Get All Activity Logs -- Admin
export const getActivityLogs = catchAsync(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({ success: true, logs });
});
