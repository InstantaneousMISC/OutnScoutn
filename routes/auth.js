const express = require('express')
const router = express.Router();
const User = require('../model/User')
const bcrypt = require('bcrypt')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')

const {
    check,
    validationResult
} = require('express-validator/check');

router.get('/', (req, res) => {
    res.status(500).send('You got this')
})


//POST ROUTE
//Route called to register a user
router.post('/join', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email entered is not valid').isEmail(),
    check('password', "Password is required with at least 8 characters").isLength({
        min: 8
    })
], async (req, res) => {
    const errors = validationResult(req)
    const saltRounds = 10;

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const {
        name,
        email
    } = req.body
    try {
        let userExists = await User.findOne({
            email
        })
        if (userExists) {
            res.status(402).json({
                errors: [{
                    msg: 'User already exists'
                }]
            })
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        const salt = await bcrypt.genSalt(saltRounds)
        const password = await bcrypt.hash(req.body.password, salt);
        //create a new user with the user info
        newUser = new User({
            name,
            email,
            password,
            avatar
        })


        //Save user
        await newUser.save()
        res.status(500).send('New User Registered')

    } catch (err) {
        res.status(422).json(err)
    }


})

router.post('/login', [check('email').isEmail(), check('password').isLength(8)], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(402).json({
            "error": [{
                errors
            }]
        })
    }
    const {
        email,
        password
    } = req.body

    try {
        let currentUser = await User.findOne({
            email
        })
        if (!currentUser) {
            return res.status(402).send('There was a problem validating the user. Please try again.')
        }
        const passMatch = await bcrypt.compare(password, currentUser.password)

        if (!passMatch) {
            return res.status(400).json({
                errors: "Authentication didn't pass"
            })
        }

        const payload = {
            currentUser: {
                id: currentUser.id
            }
        };

        jwt.sign(
            payload,
            config.get('secret'), {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });
            }
        );
    } catch (err) {
        console.error(err.message)
        res.status(400).send("error")
    }
})



module.exports = router;