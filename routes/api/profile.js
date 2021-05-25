const express = require('express');
const router = express.Router();
const User = require('../../model/User');
const Profile = require('../../model/Profile');
const auth = require('../../middleware/auth');
const pick = require('lodash/pick');
const {
    check,
    validationResult
} = require('express-validator');
const { update } = require('../../model/User');

//@route GET api/profile/me
//@ desc Test route
//@access Private
router.get('/me',auth, async(req,res) => {
    try {
        //Populate = bring name and avatar from user database that ou ref before
        const profile = await Profile.findOne({ user:req.user.id }).populate('user', ['name', 'avatar'])

        if(!profile) {
            return res.status(401).json({msg:'There is no profile for this user'})
        }
        res.json(profile)

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

//@route POST api/profile
//@ desc Create or update
//@access Private
router.post('/',auth, [
check('status', 'Status is required')
.not()
.isEmpty(),
check('skills', 'Skills is required')
.not()
.isEmpty(),
],  async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }

    const {
        skills,
    } = req.body

    //Build profile object
    let profileFields = {}
    const fieldHandler = (object, field, value) => {
        if(value) object[field] = value
    }
    profileFields.user = req.user.id;
    profileFields = pick(req.body, [
        'handle',
        'company',
        'website',
        'location',
        'status',
        'bio',
        'githubusername',
       ]);
       profileFields.socia = pick(req.body, [
        'youtube',
        'twitter',
        'facebook',
        'linkedin',
        'instagram'
       ])
       if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    try {

        let profile = await Profile.findOne({user:req.user.id})
        if(profile) {
            //Update
            profile = await Profile.findOneAndUpdate({user:req.user.id}, {$set:profileFields}, {new:true})
            return res.json(profile)
        }
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
    }
);


module.exports = router;
