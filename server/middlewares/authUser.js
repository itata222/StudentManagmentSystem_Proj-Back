const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel')
const Professor = require('../models/professorModel')

const authUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        const user =
            await Student.findOne({
                _id: data._id,
                "tokens.token": token
            })
            ||
            await Professor.findOne({
                _id: data._id,
                "tokens.token": token
            });

        if (!user)
            throw new Error('user not authrized');

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

module.exports = authUser