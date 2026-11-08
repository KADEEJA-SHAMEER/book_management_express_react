const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER
const Register = async (req, res) => {

    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        const error = new Error("All fields are required");
        error.statusCode = 400;
        throw error;
    }

    const hashpass = await bcrypt.hash(password, 10);

    const data = await User.create({
        username: username,
        password: hashpass,
        email: email
    });

    res.status(201).json({
        message: "Registration successful",
        data
    });
};


// LOGIN
const Login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Generate access token
    const accessToken = jwt.sign(
        {
            userId: user._id,
            tokenType: "access"
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
        {
            userId: user._id,
            tokenType: "refresh"
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    // Store refresh token in HttpOnly cookie
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
};


// REFRESH TOKEN
const Refresh = async (req, res) => {

    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        const error = new Error("Refresh token missing");
        error.statusCode = 401;
        throw error;
    }

    // Verify refresh token
    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    // Check token type
    if (decoded.tokenType !== "refresh") {
        const error = new Error("Invalid refresh token");
        error.statusCode = 401;
        throw error;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
        {
            userId: decoded.userId,
            tokenType: "access"
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    // Send new access token
    res.status(200).json({
        message: "Token refreshed successfully",
        accessToken: newAccessToken
    });
};


// LOGOUT
const Logout = async (req, res) => {

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        message: "Logged out successfully"
    });
};


module.exports = {
    Register,
    Login,
    Refresh,
    Logout
};
