import e, { Router } from "express";
import { createEnquiry, getPublicEnquiries, claimEnquiry, getMyEnquiries } from "../controllers/enquiry.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const enquiryRouter = Router();

enquiryRouter.post("/", createEnquiry);
enquiryRouter.get("/public", authenticateToken, getPublicEnquiries);
enquiryRouter.get("/mine", authenticateToken, getMyEnquiries);
enquiryRouter.patch("/:id/claim", authenticateToken, claimEnquiry);
export default enquiryRouter;
