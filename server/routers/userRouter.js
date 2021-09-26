const express = require('express');
require('../models/lessonModel');
const Course = require('../models/courseModel')
const auth = require('../middlewares/authUser');

const router = new express.Router();


router.get('/course', auth, async (req, res) => {
    const title = req.query.title;
    try {
        const course = await Course.findOne({ title });
        if (!course)
            return res.status(404).send({
                status: 404,
                message: 'Course not found'
            })
        const populatedCourse = course.populate('lessons.lesson').execPopulate();
        res.send(course);
    } catch (e) {
        res.status(500).send(e)
    }
})



module.exports = router;