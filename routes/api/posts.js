const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const { isEmpty } = require('lodash');
const User = require('../../model/User');
const Post = require('../../model/Post');
const Profile = require('../../model/Profile');

//@route POST api/posts
//@ desc Test route
//@access Private
router.post('/', [
    auth, 
    [
    check('text', 'Text is required')
    .not()
    .isEmpty()
    ]
] , async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
        text:req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    })

    const post = await newPost.save()
    res.json(post)
    
    console.log(user);

    try {
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
    
})

//@route GET api/posts
//@ desc Get Posts
//@access Private
router.get('/', auth, (req,res) => {
    try {
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;