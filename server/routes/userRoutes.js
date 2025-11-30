import express from "express";
import { registerUser, loginUser, getUser, updateUser } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUser); // Changed from /profile to /data
userRouter.put("/profile", protect, updateUser);

export default userRouter;