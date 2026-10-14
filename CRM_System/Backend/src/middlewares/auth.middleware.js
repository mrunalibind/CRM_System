import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Authentication token required",
        });
        return;
    }

    const token = authorization.slice(7).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret || !token) {
        res.status(401).json({
            success: false,
            message: "Invalid authentication token",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            !/^\d+$/.test(decoded.sub)
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
            return;
        }

        res.locals.employeeId = decoded.sub;
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
}
