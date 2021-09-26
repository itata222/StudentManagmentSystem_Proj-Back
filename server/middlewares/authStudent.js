const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel')

const authStudent = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const student = await Student.findOne({
            _id: data._id,
            "tokens.token": token
        })
        if (!student)
            throw new Error('student not authrized');

        req.student = student;
        req.token = token;
        next();
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

module.exports = authStudent