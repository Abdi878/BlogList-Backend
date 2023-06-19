const User = require("../models/User")
const { SECRET } = require("./config")
const logger = require("./logger")
const jwt = require("jsonwebtoken")


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
const tokenExtractor = (request,response,next) => {
  const authorization = request.get('authorization')
   if (authorization && authorization.startsWith('Bearer ')) {
     request.token = authorization.replace('Bearer ', '')
  }
  next()
} 
const userExtractor =async(request,response,next) =>{
  if(!request.token){
    return next()
  }
  const decodedToken = jwt.verify(request.token, SECRET)
  console.log(decodedToken)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  console.log(decodedToken.id)
  request.user = await User.findById(decodedToken.id)
  next()
}
module.exports = {unknownEndpoint,errorHandler,tokenExtractor,userExtractor}