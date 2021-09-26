const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,

    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    lessonsDuringWeek: [
        {
            type: String
        }
    ],
    students: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        }
    ],
    lessons: [
        {
            lesson: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson"
            }
        }
    ],
    beginningDate: {
        type: Date
    },
    endingDate: {
        type: Date
    }
}, {
    timestamps: true
})


const Course = mongoose.model('Course', courseSchema)

module.exports = Course