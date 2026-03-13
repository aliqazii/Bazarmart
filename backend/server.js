import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";

// Config
dotenv.config();

// Connect to database
connectDatabase();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => process.exit(1));
});
