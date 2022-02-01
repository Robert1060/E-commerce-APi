require('dotenv').config()
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {attachCookiesToResponse,createTokenUser} = require('../utils')

const register = async(req,res) => {
    const {email, name, password} = req.body

        const EmailAlreadyExist = await User.findOne({ email })
        if(EmailAlreadyExist){
            throw new CustomError.BadRequestError('Email value is already taken')
        }
    // first registered user is an admin
   const isFirstAccount = await User.countDocuments({})===0;
   const role = isFirstAccount? 'admin':'user'

    const user = await User.create({name,email,password,role})
        const userToken = createTokenUser(user)
        attachCookiesToResponse({res,user:userToken})

    res.status(StatusCodes.CREATED).json({ user:userToken })
}

const login = async ( req,res) => {
const {email,password} = req.body
if(!email || !password){
    throw new CustomError.BadRequestError('Please provide email and password')
}
const user = await User.findOne({email})
if(!user){
    throw new CustomError.UnauthenticatedError('Invalid email')
}
const isPasswordCorrect = await user.comparePassword(password)
if(!isPasswordCorrect){
    throw new CustomError.UnauthenticatedError('Invalid password')
}
const userToken = createTokenUser(user)
 attachCookiesToResponse({res,user:userToken})
 res.status(StatusCodes.OK).json({user:userToken})
}

const logout = async (req,res) => {
    res.cookie('token','logout',{
        httpOnly:true,
        expires:new Date(Date.now())
    })    
    res.status(StatusCodes.OK).json({msg:'Userr logged out succesfully'})
}

module.exports = {
    register,
    login,
    logout
}