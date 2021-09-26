const express = require('express');
const Lesson = require('../models/lessonModel');
const Course = require('../models/courseModel');
const Professor = require('../models/professorModel')
const authProfessor = require('../middlewares/authProfessor');
const Student = require('../models/studentModel');

const router = new express.Router();

//create professor
router.post('/professors/create', async (req, res) => {
    try {
        const professor = new Professor(req.body);
        const token = await professor.generateAuthToken();
        await professor.save();
        res.send({ user: professor, token });
    } catch (e) {
        res.status(500).send(e)
    }
})

//change password
router.patch('/professors/changePassword', authProfessor, async (req, res) => {
    const _id = req.professor.id;
    try {
        if (req.body && !req.body.password)
            throw new Error('You can only edit your password')
        const professor = await Professor.findById({ _id });
        const newPassword = req.body?.password;
        professor.password = newPassword || professor.password;
        await professor.save();
        res.send(professor);
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: err.message
        })
    }
});

//login professors
router.post('/professors/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const professor = await Professor.findProfessorbyEmailAndPassword(email, password);
        const token = await professor.generateAuthToken();
        res.send({ user: professor, token })
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: e.message
        })
    }
})

//logout professors
router.post('/professors/logout', authProfessor, async (req, res) => {
    const professor = req.professor;
    try {
        professor.tokens = professor.tokens.filter((tokenDoc) => tokenDoc.token !== req.token)
        await professor.save()
        res.send(professor)
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
    }
})

//get all courses
router.get('/professors/all-courses', authProfessor, async (req, res) => {
    try {
        const allCourses = await Course.find({})
        res.send(allCourses);
    } catch (err) {
        res.status(500).send(err)
    }
})

//get all students
router.get('/professors/all-students', authProfessor, async (req, res) => {
    try {
        const allStudents = await Student.find({})
        res.send(allStudents);
    } catch (err) {
        res.status(500).send(err)
    }
})

//add course
router.post('/professors/add-course', authProfessor, async (req, res) => {
    try {
        const newCourse = new Course(req.body.course);
        await newCourse.save();
        res.send(newCourse)
    } catch (err) {
        res.status(500).send(err)
    }
})

//add student
router.post('/professors/add-student', authProfessor, async (req, res) => {
    try {
        const newStudent = new Student(req.body.user);
        await newStudent.save();
        res.send(newStudent)
    } catch (err) {
        res.status(500).send(err)
    }
})


//getStudentsInSpecificCourse
router.post('/professors/get-courseStudents', authProfessor, async (req, res) => {
    const courseID = req.body.course._id
    try {
        const course = await Course.findById(courseID)
        if (course != null) {
            const courseStudentsPopulated = await course.populate('students.student').execPopulate();
            // const coursePopulated = await courseStudentsPopulated.populate('lessons.lesson').execPopulate();
            return res.send(courseStudentsPopulated);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

//add student to a course
router.post('/professors/add-studentToCourse', authProfessor, async (req, res) => {
    const courseID = req.body.courseID;
    const studentID = req.body.studentID;
    try {
        const course = await Course.findById(courseID)
        const student = await Student.findById(studentID)
        student.courses.forEach((courseObj) => {
            if (String(courseObj.course) === String(course._id)) {
                throw new Error('Student already in that Course')
            }
        });
        student.courses = student.courses.concat({ course: course._id });
        course.students = course.students.concat({ student: student._id });
        await student.save();
        await course.save();
        res.send(student)
    } catch (err) {
        res.send({
            status: 500,
            message: err.message
        })
    }
});

//add Lesson To a Course
router.post('/professors/add-lessonToCourse', authProfessor, async (req, res) => {
    const courseID = req.query.courseID;
    let lessons = [];
    try {
        const course = await Course.findById(courseID)
        if (course == null) {
            throw res.status(404).send({
                status: 404,
                message: 'Course not found'
            })
        }
        let beginningDate = course.beginningDate;
        const endingDate = course.endingDate;
        const lessonsDuringWeek = course.lessonsDuringWeek;
        lessonsDuringWeek.forEach((day) => {
            switch (day) {
                case 'Sunday':
                    lessons.push(1)
                    break;
                case 'Monday':
                    lessons.push(2)
                    break;
                case 'Tuesday':
                    lessons.push(3)
                    break;
                case 'Wednesday':
                    lessons.push(4)
                    break;
                case 'Thursday':
                    lessons.push(5)
                    break;
                case 'Friday':
                    lessons.push(6)
                    break;
                case 'Saterday':
                    lessons.push(7)
                    break;
            }
        });
        let allCourseLessons = [];
        let numbersPassedSinceBeginning = 0;
        while (beginningDate.getTime() < endingDate) {
            lessons.forEach(async (day) => {
                if (beginningDate.getDay() === day) {
                    const currentLesson = new Lesson({
                        date: new Date().setDate(new Date().getDate() + numbersPassedSinceBeginning),
                        course: courseID,
                        attendedStudents: []
                    });
                    course.lessons = course.lessons.concat({ lesson: currentLesson._id })
                    allCourseLessons.push(currentLesson)
                }
                beginningDate.setDate(beginningDate.getDate() + 1)
                numbersPassedSinceBeginning++;
            });
        }
        async function saveElements() {
            for (let lesson of allCourseLessons) {
                await lesson.save();
            }
            await course.save();
        }
        saveElements()
        res.send({ course });
    }
    catch (err) {
        console.log('err', err)
        res.send(err)
    }
})

router.get('/professors/getCourseData', authProfessor, async (req, res) => {
    const courseID = req.query.courseID
    try {
        const course = await Course.findById(courseID)
        if (course == null)
            throw res.status(404).send({
                status: 404,
                message: 'Course not found'
            })
        const populatedCourse = await course.populate('lessons.lesson').execPopulate();
        res.send(populatedCourse)
    } catch (err) {

    }
})

router.get('/professors/getStudentAppearences', authProfessor, async (req, res) => {
    const courseID = req.query.courseID;
    const studentID = req.query.studentID;
    let studentAppearences = [];
    try {
        const course = await Course.findById(courseID);
        const coursePopulated = await course.populate('lessons.lesson').execPopulate();
        const courseLessons = coursePopulated.lessons;
        courseLessons.forEach((lesson, i) => {
            lesson.lesson.attendedStudents.forEach(student => {
                if (studentID == student.student) {
                    studentAppearences.push({
                        lesson: lesson.lesson.date,
                        attended: student.attended,
                        reason: student.reason
                    })
                }
            });
        });
        res.send(studentAppearences)
    } catch (e) {
        res.send(e)
    }
})


module.exports = router;