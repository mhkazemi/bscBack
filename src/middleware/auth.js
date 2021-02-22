const jwt = require('jsonwebtoken')
const User = require('../models/user')

const user = new User()

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, '123456789')
    const foundUser = await user.findById({id: decoded.id})

    if (!foundUser) {
      throw new Error()
    }

    req.token = token
    req.user = foundUser
    next()
  } catch (e) {
    console.log(e)
    res.status(401).send({error: 'Please authenticate.'})
  }
}

module.exports = auth