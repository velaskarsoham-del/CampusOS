const express = require("express");

const router = express.Router();

const User = require("../models/user");

// =====================================================
// GET ALL USERS
// GET /users
// =====================================================

router.get("/users", async (req, res) => {
    try {
        const users = await User.find(
            {},
            {
                password: 0,
            }
        ).sort({
            createdAt: -1,
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
});

// =====================================================
// GET USER BY ID
// GET /users/:id
// =====================================================

router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(
            req.params.id,
            {
                password: 0,
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message,
        });
    }
});

module.exports = router;