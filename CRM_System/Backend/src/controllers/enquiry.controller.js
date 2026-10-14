import { pool } from "../config/db.js";
import { createEnquirySchema } from "../models/enquiry.model.js";

export async function createEnquiry(req, res) {
    const validation = createEnquirySchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json({
            success: false,
            message: "Invalid enquiry data",
            errors: validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    const { name, email, phone, course_interest } = validation.data;

    try {
        const result = await pool.query(
            `INSERT INTO enquiries
         (name, email, phone, course_interest)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, course_interest,
                 claimed_by, created_at`,
            [name, email, phone ?? null, course_interest]
        );

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Enquiry creation failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to submit enquiry",
        });
    }
}

export async function getPublicEnquiries(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, name, email, phone, course_interest, created_at
       FROM enquiries
       WHERE claimed_by IS NULL
       ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Fetching public enquiries failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch public enquiries",
        });
    }
}

export async function claimEnquiry(req, res) {
    const enquiryId = req.params.id;
    const employeeId = res.locals.employeeId;

    if (!/^[1-9]\d*$/.test(enquiryId)) {
        res.status(400).json({
            success: false,
            message: "Invalid enquiry ID",
        });
        return;
    }

    try {
        const result = await pool.query(
            `UPDATE enquiries
       SET claimed_by = $1
       WHERE id = $2
         AND claimed_by IS NULL
       RETURNING id, name, email, phone, course_interest,
                 claimed_by, created_at`,
            [employeeId, enquiryId]
        );

        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                message: "Enquiry claimed successfully",
                data: result.rows[0],
            });
            return;
        }

        const existing = await pool.query(
            `SELECT id FROM enquiries WHERE id = $1`,
            [enquiryId]
        );

        if (existing.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
            return;
        }

        res.status(409).json({
            success: false,
            message: "Enquiry has already been claimed",
        });
    } catch (error) {
        console.error("Claiming enquiry failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to claim enquiry",
        });
    }
}

export async function getMyEnquiries(req, res) {
    const employeeId = res.locals.employeeId;

    try {
        const result = await pool.query(
            `SELECT id, name, email, phone, course_interest, created_at
       FROM enquiries
       WHERE claimed_by = $1
       ORDER BY created_at DESC`,
            [employeeId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Fetching claimed enquiries failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch your enquiries",
        });
    }
}
