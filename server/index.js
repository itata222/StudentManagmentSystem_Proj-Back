const express = require('express')
const cors = require('cors')

const app = express();
const port = process.env.PORT
const studentsRouter = require('./routers/studentRouter')
const professorsRouter = require('./routers/professorRouter')
const userRouter = require('./routers/userRouter')
require('./db/db')

app.use(cors());
app.use(express.json())
app.use(studentsRouter)
app.use(professorsRouter)
app.use(userRouter)
app.listen(port, () => {
    console.log('server runs, port:', port)
})
