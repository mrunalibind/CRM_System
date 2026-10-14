import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../models/auth.model.js";

export async function register ( req, res ){
  // 1. Validate incoming data
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration data",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const { name, email, password } = validation.data;

  try {
    // 2. Hash the password. Never store plain-text passwords.
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert the employee into PostgreSQL.
    const result = await pool.query(
      `INSERT INTO employees (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    // 4. Return the created employee, not the password hash.
    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    // PostgreSQL unique-constraint violation
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Employee registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register employee",
    });
  }
}


export async function login ( req, res ) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login data",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const { email, password } = validation.data;

  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM employees
       WHERE email = $1`,
      [email]
    );

    const employee = result.rows[0];

    // Use the same response for unknown emails and wrong passwords.
    if (!employee) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      employee.password_hash
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");

      res.status(500).json({
        success: false,
        message: "Authentication service is not configured",
      });
      return;
    }

    const token = jwt.sign(
      { sub: String(employee.id) },
      secret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        employee: {
          id: String(employee.id),
          name: employee.name,
          email: employee.email,
        },
      },
    });
  } catch (error) {
    console.error("Employee login failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
}

