const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        refreshTokenHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        isRevoked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Session", sessionSchema);