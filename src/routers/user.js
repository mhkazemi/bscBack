const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const val = require('jsonschema').validate;

const User = require('../models/user')

const loginSchema = require('../schemas/login')
const createUserSchema = require('../schemas/createuser')

const user = new User()

const router = new express.Router()

router.post('/users/signup', async (req, res) => {

  try {

    const errors = val(req.body, createUserSchema).errors

    if (errors[0]) {
      return res.status(200).send({error: 'dataValidationError'})
    }

    const duplicateKey = await user.checkDuplicateKey({username: req.body.username})

    if (duplicateKey) {
      return res.status(200).send({error: 'duplicateKey'})
    }

    const encryptPassword = await bcrypt.hash(req.body.password, 8)

    const createdUser = await user.createUser({
      role: req.body.role,
      name: req.body.name,
      password: encryptPassword,
      username: req.body.username
    })

    const token = generateAuthToken({
      id: createdUser.id,
      role: createdUser.role
    })

    // delete createdUser.id
    // delete createdUser.credit
    // delete createdUser.parent
    // delete createdUser.password
    console.log('before success');
    res.status(201).send({...createdUser, token, status:"success"})
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/login', async (req, res) => {

  try {
    const errors = val(req.body, loginSchema).errors

    if (errors[0]) {
      return res.status(400).send({error: 'dataValidationError'})
    }

    const foundUser = await user.findByCredentials(req.body)

    if (!foundUser) {
      return res.status(400).send({error: 'userNotFound'})
    }

    const isMatch = await bcrypt.compare(req.body.password, foundUser.password)

    if (!isMatch) {
      return res.status(400).send({error: 'incorrectPassword'})
    }

    const token = generateAuthToken({
      id: foundUser.id,
      role: foundUser.role
    })

    // delete foundUser.id
    // delete foundUser.parent
    // delete foundUser.credit
    // delete foundUser.password

    res.send({...foundUser, token})

  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

module.exports = router

const generateAuthToken = ({id, role}) => {

  console.log(id, role);
  const token = jwt.sign({id, role}, '123456789')
  return token
}