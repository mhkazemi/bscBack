const express = require('express')

const val = require('jsonschema').validate;

const Questionnaire = require('../models/questionnaire')
const auth = require('../middleware/auth')

const createQuestionnaireSchema = require('../schemas/createQuestionnaire')

const questionnaire = new Questionnaire()

const router = new express.Router()

router.post('/questionnaire', auth, async (req, res) => {

  try {
    const errors = val(req.body, createQuestionnaireSchema).errors
    console.log(errors)
    if (errors[0]) {
      return res.status(400).send({ error: 'dataValidationError' })
    }

    let time = 2;

    if (req.body.time) {
      time = req.body.time;
    }

    const duplicateTitle = await questionnaire.checkDuplicateTitle({ title: req.body.title })

    if (duplicateTitle) {
      return res.status(400).send({ error: 'duplicateTitle' })
    }

    const createdQuestionnaire = await questionnaire.createQuestionnaire({
      time,
      creator: req.user.id,
      title: req.body.title
    })

    for (let i = 0; i < req.body.questions.length; i++) {
      const question = req.body.questions[i]

      if (!question.hint) {
        question.hint = ""
      }

      const createdQuestion = await questionnaire.addQuestion({
        q: question.q,
        o1: question.o1,
        o2: question.o2,
        o3: question.o3,
        o4: question.o4,
        hint: question.hint,
        answer: question.answer,
        questionnaire_id: createdQuestionnaire.id
      })
    }

    // delete createdUser.id
    // delete createdUser.credit
    // delete createdUser.parent
    // delete createdUser.password

    res.status(201).send({ ...createdQuestionnaire })
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'internal server error' })
  }
})



// router.get('/questionnaire/list', auth, async (req, res) => {
router.get('/questionnaire/list', async (req, res) => {
  // async function questionnairesListFunc(req, res) {
  try {
    console.log(req.query.id);
    const user_id = req.query.id;
    //getting the list of all questionnaires from the database
    const questionnairesList = await questionnaire.questionnairesListHandler(user_id);
    // console.log(questionnairesList);

    for (const item of questionnairesList) {
      const row = await questionnaire.answeredQuestionnairesHandler(user_id, item.id);
      if (row.length === 0) {
        item.answered = 'unseen';
      } else {
        item.answered = 'seen';
      }
    }

    // for (const item of questionnairesList) {
    //   delete item.create_date;
    // }

    console.log(questionnairesList);

    // filling the response object

    res.status(200).send(questionnairesList)
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'internal server error' })
  }
})


///finish
router.get('/questionnaire/questions', async (req, res) => {
// router.get('/questionnaire/questions', auth, async (req, res) => {
  // async function questionsListFunc(req, res) {
  // console.log(req.data);
  try {
    let id = req.query.id;
    let questionsList = await questionnaire.questionsListHandler(id);

    for (const question of questionsList) {
      question.answers = await questionnaire.questionsAnswersHandler(question.id);
    }
    console.log(questionsList);
    // filling the response object
    res.status(200).send(questionsList)
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'internal server error' })
  }

})

////finish
// router.get('/questionnaire/viewAnswers', auth, async (req, res) => {
router.get('/questionnaire/viewAnswers', async (req, res) => {
  // async function viewAnswers(req, res) {
  try {
    const user_id = req.query.uid;
    const questionnaire_id = req.query.qnid;
    const answers = await questionnaire.userAnswersHandler(user_id, questionnaire_id);
    console.log(answers);

    // filling the response object
    res.status(200).send(answers)

  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'internal server error' })
  }
})


///finish
// router.post('/questionnaire/saveUserAnswers', auth, async (req, res) => {
router.post('/questionnaire/saveUserAnswers', async (req, res) => {
  // async function saveAnswers(req, res) {
  try {
    const user_id = req.body.user_id;
    const answers = req.body.answers;
    const questionnaire_id = req.body.questionnaire_id;
    await questionnaire.saveAnswersHandler(user_id, questionnaire_id, answers);

    // filling the response object
    res.status(200).send('answers sccuessfully added to database')
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'internal server error' })
  }
})


module.exports = router