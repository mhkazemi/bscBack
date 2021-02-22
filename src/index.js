const express = require('express')
const userRouter = require('./routers/user')
const questionnaireRouter = require('./routers/questionnaire')
// const studentRouter = require('./routers/student')

const app = express()
const port = 3000

app.use(express.json())

app.use(userRouter)
// app.use(studentRouter)
app.use(questionnaireRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
