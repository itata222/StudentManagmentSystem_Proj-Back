const mongoose = require('mongoose')

mongoose.connect(process.env.SMS_MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});