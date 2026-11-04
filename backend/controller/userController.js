const User =require("../model/userModel")
const bcrypt =require("bcrypt")
const jwt = require("jsonwebtoken");
const Session = require("../model/sesionModel");
const crypto = require("crypto");


const Register=async(req,res)=>{
    const {username,password,email}=req.body;
    if(!username || !password || !email)
    {
        const error=new Error("all fileds are required")
        error.statusCode=400;
        throw error;
    }
    const hashpass= await bcrypt.hash(password,10)
    const data=await User.create({
        username:username,password:hashpass,email:email
    })
    res.status(201).json(data)
}

const Login = async (req, res) => {
    const { email, password } = req.body;

    // Check whether fields are provided
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    // Find user using email
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

const sessionId = crypto.randomUUID();
    // Generate access token
const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
);

// Generate refresh token
const refreshToken = jwt.sign(
    { userId: user._id ,
        sessionId: sessionId,
        tokenType: "refresh"
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
);

// Hash refresh token
const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  
// Store session in MongoDB
await Session.create({
    userId: user._id,
     sessionId: sessionId,
    refreshTokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

// Send refresh token as HttpOnly cookie
res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

// Send access token to React
res.status(200).json({
    message: "Login successful",
    accessToken
});
}

const Refresh = async (req, res, next) => {
    try {
        // 1. Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            const error = new Error("Refresh token missing");
            error.statusCode = 401;
            throw error;
        }

        // 2. Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // 3. Check token payload
        if (
            decoded.tokenType !== "refresh" ||
            !decoded.sessionId ||
            !decoded.userId
        ) {
            const error = new Error("Invalid refresh token");
            error.statusCode = 401;
            throw error;
        }

        // 4. Find the exact active session
        const session = await Session.findOne({
            userId: decoded.userId,
            sessionId: decoded.sessionId,
            isRevoked: false
        });

        if (!session) {
            const error = new Error("Session not found or revoked");
            error.statusCode = 401;
            throw error;
        }

        // 5. Check session expiry
        if (session.expiresAt <= new Date()) {
            const error = new Error("Session expired. Please login again");
            error.statusCode = 401;
            throw error;
        }

        // 6. Hash incoming refresh token
        const incomingHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // 7. Generate new access token
        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                tokenType: "access"
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        // 8. Generate new refresh token
        const newRefreshToken = jwt.sign(
            {
                userId: decoded.userId,
                sessionId: decoded.sessionId,
                tokenType: "refresh"
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // 9. Hash new refresh token
        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        // 10. Atomically replace old hash with new hash
        const updatedSession = await Session.findOneAndUpdate(
            {
                userId: decoded.userId,
                sessionId: decoded.sessionId,
                refreshTokenHash: incomingHash,
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            },
            {
                $set: {
                    refreshTokenHash: newRefreshTokenHash,
                    expiresAt: new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                }
            },
            { new: true }
        );

        // 11. Handle failed rotation
        if (!updatedSession) {
            await Session.findOneAndUpdate(
                {
                    userId: decoded.userId,
                    sessionId: decoded.sessionId
                },
                {
                    $set: { isRevoked: true }
                }
            );

            const error = new Error(
                "Refresh token reuse detected. Please login again"
            );
            error.statusCode = 401;
            throw error;
        }

        // 12. Send new refresh token cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 13. Send new access token
        res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (err) {
        next(err);
    }
};

const Logout = async (req, res, next) => {
    try {
        // 1. Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            const error = new Error("Already logged out");
            error.statusCode = 401;
            throw error;
        }

        // 2. Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // 3. Check token type
        if (
            decoded.tokenType !== "refresh" ||
            !decoded.userId ||
            !decoded.sessionId
        ) {
            const error = new Error("Invalid refresh token");
            error.statusCode = 401;
            throw error;
        }

        // 4. Revoke only this device's session
        await Session.findOneAndUpdate(
            {
                userId: decoded.userId,
                sessionId: decoded.sessionId,
                isRevoked: false
            },
            {
                $set: { isRevoked: true }
            }
        );

        // 5. Clear refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        // 6. Send response
        res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { Register, Login,Refresh,Logout };
