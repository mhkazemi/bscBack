const { pool, format } = require('../db/postgres')

class Questionnaire {

  constructor() {
  }

  async getQuestionnaire(user_id) {

    try {
      const { rows } = await pool.query(`WITH status AS
      (SELECT q.questionnaire_id AS status, qu.id ,qu.title FROM questionnaire qu
      LEFT JOIN (select questionnaire_id,user_id FROM question q
      LEFT JOIN  users_answers ua ON q.id = ua.question_id
      where user_id = ${user_id}) q ON qu.id = q.questionnaire_id
      group by qu.id,q.questionnaire_id)
      , qnumber AS
      (SELECT qu.title, qu.id, count(question) AS qnumber
      FROM questionnaire qu
      LEFT JOIN question q ON qu.id = q.questionnaire_id
      GROUP BY 1,2)
      SELECT status , status.id AS id,status.title ,qnumber
      FROM status  INNER JOIN qnumber ON qnumber.id = status.id`)

      return rows

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async getQuestionnaireTitle(questionnaireId) {

    try {
      const { rows } = await pool.query(`SELECT title 
                                         FROM questionnaire 
                                         WHERE id = ${questionnaireId};`)
      return rows[0].title

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async getQuestions(questionnaireId) {

    try {
      const { rows } = await pool.query(`SELECT * 
                                         FROM question
                                         WHERE questionnaire_id = ${questionnaireId};`)
      return rows

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async getOptions(questionId) {

    try {
      console.log('---------------optinsget-----------');
      const { rows } = await pool.query(`SELECT * 
                                         FROM option
                                         WHERE question_id = ${questionId};`)
      return rows

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async postAnswers(values) {

    try {
      const rows = await pool.query(format(`INSERT INTO users_answers (user_id, question_id, answer)
                                              VALUES %L`, values))
      console.log(rows);
      return rows

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async checkDuplicateTitle({ title }) {
    try {
      const query = `SELECT * FROM questionnaire WHERE title = $1`
      const { rows } = await pool.query(query, [title])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async createQuestionnaire({ creator, time, title }) {

    try {
      const values = [creator, time, title]
      let query = `INSERT INTO questionnaire(creator, time, title)
                   VALUES($1, $2, $3)
                   RETURNING *`
      const { rows } = await pool.query(query, values)

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async addQuestion({ o1, o2, o3, o4, answer, hint, questionnaire_id, q }) {

    try {
      const values = [o1, o2, o3, o4, answer, hint, questionnaire_id, q]
      let query = `INSERT INTO question(o1, o2, o3, o4, answer, hint, questionnaire_id, q)
                   VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                   RETURNING *`
      const { rows } = await pool.query(query, values)

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  //////////////////backsaeid

  async questionnairesListHandler() {
    try {
      // fetch all records from questionnaire table
      const { rows } = await pool.query(`SELECT *
                                         FROM questionnaire`);

      // tip: rows.rows is an array!
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }

  }

  async answeredQuestionnairesHandler (user_id, questionnaire_id) {
    try {
      // const { rows } = await pool.query(`SELECT *
      //                                    FROM "answered_ questionnaire" aq
      //                                    WHERE aq." questionnaire_id" = '${questionnaire_id}' and aq.user_id = '${user_id}';`);
      console.log(user_id);
      console.log(questionnaire_id);
      const  rows  = await pool.query(`SELECT *
                                       FROM report aq
                                       WHERE aq.questionnaire_id = ${questionnaire_id} and aq.user_id = ${user_id};`);
      return rows.rows;
    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async questionsListHandler(id) {
    try {
      // const { rows } = await pool.query(`SELECT q.id, q.content, qt.type
      //                                    FROM "questions" q, "questionnaire" qn, "questions_type" qt
      //                                    WHERE q.questionnaire_id = qn.id and qt.question_id = q.id and qn.id = '${id}';`);

      const { rows } = await pool.query(`SELECT q.id, q.content, q.type
                                         FROM question q, questionnaire qn
                                         WHERE q.questionnaire_id = qn.id and qn.id = ${id};`)

      // tip: rows.rows is an array!
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async questionsAnswersHandler(id) {
    try {
      // const { rows } = await pool.query(`SELECT a.id, a.content
      //                                    FROM "answers" a
      //                                    WHERE a.question_id = '${id}';`);

      const { rows } = await pool.query(`SELECT a.id, a.content
                                         FROM option a
                                         WHERE a.question_id = ${id};`);
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async userAnswersHandler(user_id, questionnaire_id) {

    const { rows } = await pool.query(`SELECT aq.question_id, aq.answer_id, aq.tashrihi_answer
                                       FROM usersanswer aq, question q
                                       WHERE aq.user_id = ${user_id} and aq.question_id = q.id and q.questionnaire_id = ${questionnaire_id};`);
    return rows;
  };

  async saveAnswersHandler(user_id, questionnaire_id, answers) {
    try {
      await pool.query(`INSERT INTO report (questionnaire_id, user_id)
                        VALUES (${questionnaire_id}, ${user_id});`);

      let string;
      for (const answer of answers) {
        if (answer.tashrihi === null) {
          string = null;
        } else {
          string = `'${answer.tashrihi}'`
        }
        console.log(string);
        await pool.query(`INSERT INTO usersanswer (user_id, question_id, answer_id, tashrihi_answer)
                          VALUES ('${user_id}', '${answer.question_id}', ${answer.answer_id}, ${string});`);
      }
    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }
}


module.exports = Questionnaire


