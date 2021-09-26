const express = require('express');
require('../models/lessonModel');
const Student = require('../models/studentModel')
const authStudent = require('../middlewares/authStudent');
const Lesson = require('../models/lessonModel');

const router = new express.Router();

//change password
router.patch('/students/changePassword', authStudent, async (req, res) => {
    const _id = req.student.id;
    try {
        if (req.body && !req.body.password)
            throw new Error('You can only edit your password')
        const student = await Student.findById({ _id });
        const newPassword = req.body?.password;
        student.password = newPassword || student.password;
        await student.save();
        res.send(student);
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: err.message
        })
    }
});

//login students
router.post('/students/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findStudentbyEmailAndPassword(email, password);
        const token = await student.generateAuthToken();
        res.send({ user: student, token })
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: e.message
        })
    }
})

//logout students
router.post('/students/logout', authStudent, async (req, res) => {
    const student = req.student;
    try {
        student.tokens = student.tokens.filter((tokenDoc) => tokenDoc.token !== req.token)
        await student.save()
        res.send(student)
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
    }
})

//get my courses
router.get('/students/my-courses', authStudent, async (req, res) => {
    const student = req.student;
    try {
        const halfPopulatedStudent = await student.populate('courses.course').execPopulate();
        const populatedStudent = await halfPopulatedStudent.populate('courses.course.lessons.lesson').execPopulate();
        res.send(populatedStudent);
    } catch (err) {
        res.status(500).send(err)
    }
})

//add missing appearence lesson 
router.post('/students/update-appearences', authStudent, async (req, res) => {
    const student = req.student;
    const attended = req.body.attended;
    let reason = req.body.reason;
    try {
        if (attended)
            reason = "Attended!"
        const lesson = await Lesson.findById(req.body.lesson._id)
        if (!lesson)
            return res.status(404).send({
                status: 404,
                message: 'lesson not found'
            })
        lesson.attendedStudents.forEach((studentObj, i) => {
            if (studentObj.student == student.id) {
                throw new Error('student already updated this lesson')
            }
        });
        lesson.attendedStudents = lesson.attendedStudents.concat({
            student: student._id,
            attended,
            reason
        })
        await lesson.save();
        res.send(lesson)
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: err.message
        })
    }
})


module.exports = router;