const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator')

//@route POST api/users
//@ desc Test route
//@access Public
router.post('/', [
    check('name', 'Name is required')
    .not()
    .isEmail(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({min:6})
], async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    
    const {name, email, password} = req.body

    try {
        let user = await User.findOne({email})
        if(user) {
            return res.status(400).json({errors:[{msg:'This email already exists'}]})
        }

        //Avatar generate
        const avatar = gravatar.url(email, {
            s:200,
            r:'pg',
            d:'mm'
        })

        //Create user intance
        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save()
        
        const payload = {
            user:{
                id:user.id
            }
        };

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 36000 }, 
            (err, token) => {
                if(err) throw err;
                res.json({token})
            });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({errors:'Server Error'})
    }

})

module.exports = router;