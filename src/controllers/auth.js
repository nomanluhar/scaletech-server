const db = require('../db');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const { SECRET } = require('../constansts');
const nodemailer = require('nodemailer');

exports.getUsers = async (req, res) => {
    try {
        const { rows } = await db.query('select user_id,email from users');
        return res.status(200).json({
            success: true,
            users: rows
        })
    } catch (error) {
        console.log(error.message);
    };
};


exports.register = async (req, res) => {
    const { user_name, user_email, user_password } = req.body;
    try {
        const hashedPassword = await hash(user_password, 10);
        await db.query('insert into users(user_name,user_email,user_password) values ($1 , $2 , $3)', [user_name, user_email, hashedPassword]);

        let hashEmail = await hash(user_email, 10);
        hashEmail = hashEmail.replace(/\//g, "$");
        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "trinisoft020@gmail.com",
                pass: "faspdujfphvkworw"
            }
        });
        var mailOptions = {
            from: "trinisoft020@gmail.com",
            to: user_email,
            subject: 'Email Confrimation',
            html: `Press <a href=http://localhost:3000/verify/:${hashEmail}> here </a> to verify your email. Thanks`
        };

        smtpTransport.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.log(error)
            } else {
                return res.status(201).json({
                    success: true,
                    message: 'The registration was successfull'
                });
            };
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        })
    };
};

exports.userEmailAuth = async (req, res) => {
    // console.log(req);
    // console.log(req.body)
};

exports.login = async (req, res) => {
    let user = req.user;
    let payload = {
        id: user.user_id,
        email: user.email
    }
    try {
        const token = await sign(payload, SECRET, { expiresIn: 60000 })
        return res.status(200).cookie('token', token, { httpOnly: true }).json({
            success: true,
            message: 'Logged in successfully',
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        })
    };
};

exports.protected = async (req, res) => {
    try {
        return res.status(200).json({
            info: 'protected information',
        })
    } catch (error) {
        console.log(error.message);
    };
};

exports.logout = async (req, res) => {
    try {
        return res.status(200).clearCookie('token', { httpOnly: true }).json({
            success: true,
            message: 'Logged out successfully',
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        })
    };
};