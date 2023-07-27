require('dotenv').config()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { NodeMailer } = require('../nodemailer/nodemailer')
const Secret_Key = process.env.Secret_Key


module.exports.getUser = async (req, res) => {
    const user = await User.find();
    res.send(user);
}

module.exports.getUserRestrictData = async (req, res) => {
    const user = await User.find({}, 'name email account_activated');
    res.send("<h1>Welcome To URL SHORTENER Application</h1>");
}

module.exports.Signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        // save the user
        await newUser.save();


        const randomString =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const link = `https://gregarious-narwhal-772a00.netlify.app/UrlShortener/account_activation/${randomString}`;

        const sub = "Account Activation"

        NodeMailer(randomString, email, link, res, sub);
    }
    catch (err) {
        console.error('Error signing up user', err);
        return res.status(400).json({ Message: "Internal server error" })
    }
}

module.exports.AccountActivation = async (req, res) => {

    try {
        const token = req.params.id;

        const user = await User.findOne({ token_activate_account: token });

        if (!user) {
            return res.status(400).json({ Message: "User not found or Activated account" });
        }

        user.account_activated = true

        user.token_activate_account = "Account Activated";

        const updated = await User.findByIdAndUpdate(user._id, user);

        if (updated) {
            return res.status(201).json({ Message: "Account activated" });
        }
    }
    catch (err) {
        console.error('Error signing up user', err);
        return res.status(400).json({ Message: "Internal server error" })
    }
}

module.exports.Signin = async (req, res) => {

    const { email, password } = req.body;

    // find the user by email
    const user = await User.findOne({ email })

    if (!user) {
        return res.status(400).json({ message: 'Authentication failed' });
    }

    // compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(400).json({ message: 'Authentication failed' });
    }

    // check Account activated or not
    if (user.account_activated) {
        // generate and send the JWT token
        const token = jwt.sign({ userId: user._id }, Secret_Key, { expiresIn: '2h' });
        return res.status(201).json({ token: token })
    }
}

module.exports.PasswordResetLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ Err: "please enter valid email" });

        }
        const matchedUser = await User.findOne({ email });
        if (!matchedUser) {
            return res.status(400).json({ Err: "user not found exists" });

        }

        const randomString =
            Math.random().toString(16).substring(2, 15) +
            Math.random().toString(16).substring(2, 15);


        matchedUser.token_reset_password = randomString;

        await User.findByIdAndUpdate(matchedUser.id, matchedUser);

        //sending email for resetting
        const link = `https://gregarious-narwhal-772a00.netlify.app/UrlShortener/UpdatePassword/${randomString}`;

        const sub = "Reset password"

        NodeMailer(randomString, email, link, res, sub);

    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports.PasswordUpdate = async (req, res) => {
    try {
        const resetToken = req.params.id;
        const { password } = req.body;
        const matchedUser = await User.findOne({ token_reset_password: resetToken });
        if (matchedUser === null || matchedUser.token_reset_password === "") {
            return res
                .status(400)
                .json({ Err: "user not exists or reset link expired" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        matchedUser.password = hashedPassword;
        matchedUser.token_reset_password = `Password Updated on ${new Date()}`;


        await User.findByIdAndUpdate(matchedUser.id, matchedUser);
        return res.status(201).json({
            message: `${matchedUser.username} password has beed changed sucessfully`,
        });
    } catch (error) {
        return res
            .status(400)
            .json({ Err: "user not exists or reset link expired" });
    }
}










