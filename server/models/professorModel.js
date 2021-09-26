const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const professorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Must enter a Name"],

        },
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            unique: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            // validate(value) {
            //     const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
            //     if (!passRegex.test(value)) {
            //         throw new Error("Password must contain big and small characters so as numbers");
            //     }
            // },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ]
    },
    {
        timestamps: true,
    }
);


professorSchema.pre("save", async function (next) {
    const admin = this;

    if (admin.isModified("password")) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }

    next();
});

professorSchema.statics.findProfessorbyEmailAndPassword = async (email, password) => {
    const user = await Professor.findOne({ email });
    if (!user) {
        throw new Error("unable to login");
    }
    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
        throw new Error("unable to login");
    }

    return user;
};

professorSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        {
            _id: user._id,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "6h"
        }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

professorSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
};

const Professor = mongoose.model("Professor", professorSchema);

module.exports = Professor;