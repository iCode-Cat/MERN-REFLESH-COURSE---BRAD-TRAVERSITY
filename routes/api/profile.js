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
    profileFields = pick(req.body, [
        'handle',
        'company',
        'website',
        'location',
        'status',
        'bio',
        'githubusername',
       ]);
       profileFields.social = pick(req.body, [
        'youtube',
        'twitter',
        'facebook',
        'linkedin',
        'instagram'
       ])
       profileFields.user = req.user.id;
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

//@route GET api/profile
//@ desc Get all profiles
//@access Public
router.get('/', async(req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name','avatar'])
        res.json(profiles)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

//@route GET api/profile/user/id
//@ desc Get user profile
//@access Public
router.get('/user/:user_id', async(req,res) => {
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name','avatar'])
        if(!profile) {
            return res.status(400).send({msg:'User cannot find.'})
        }
        res.json(profile)
    } catch (error) {
        console.log(error.kind);
        if(error.kind == 'ObjectId') return res.status(400).send({msg:'User cannot find.'})
        res.status(500).send('Server Error')
    }
})



//@route DELETE api/profile
//@ desc Delete user , profile and posts
//@access Public
router.delete('/', auth, async(req,res) => {
    //@todo delete posts...
    try {
        await Profile.findOneAndRemove({user:req.user.id})
        await User.findOneAndRemove({_id:req.user.id})
        res.json('User deleted!')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

// @route  PUT api/profile/experience
 // @desc     Add profile experience
// @access   Private
router.put('/experience', [auth, [
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From is required')
    .not()
    .isEmpty()
]], async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
 
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

// @route  Delete api/profile/experience/:exp_id
 // @desc  Delete experience from profile
// @access Private
router.delete('/experience/:exp_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({user:req.user.id})
 
        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        console.log(removeIndex);
 
        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error')
    }
})

// @route  PUT api/profile/education
 // @desc     Add profile education
// @access   Private
router.put('/education', [auth, [
    check('school', 'School is required')
    .not()
    .isEmpty(),
    check('degree', 'Degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy', 'fField of study is required')
    .not()
    .isEmpty()
]], async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;
 
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
})

// @route  Delete api/profile/education/:edu_id
 // @desc  Delete education from profile
// @access Private
router.delete('/education/:edu_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({user:req.user.id})
 
        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        console.log(removeIndex);
 
        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error')
    }
})

module.exports = router;
