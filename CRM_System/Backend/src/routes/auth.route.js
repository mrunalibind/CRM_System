import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "JWT authentication successful",
    employeeId: res.locals.employeeId,
  });
});


export default authRouter;
