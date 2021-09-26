const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    attendedStudents: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            },
            attended: {
                type: Boolean
            },
            reason: {
                type: String
            }
        }
    ]
})

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = Lesson