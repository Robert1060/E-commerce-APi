const User = require('../models/User')
const CustomError = require('../errors')
const {StatusCodes} = require('http-status-codes');
const {createTokenUser,attachCookiesToResponse,checkPermissions} = require('../utils')


const getAllUsers = async ( req,res) =>{
    console.log(req.user);
    const users = await User.find({role:'user'}).select('-password')
    
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async ( req,res) =>{
    
    const user = await User.findOne({_id:req.params.id}).select('-password')

    if(!user){
        throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`)
    }
    checkPermissions(req.user,user._id)
    res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req,res) =>{
    const user = req.user
    res.status(StatusCodes.OK).json({ user }) 
}
// Update User With user.save
const updateUser = async (req,res) => {
    const {name,email} = req.body
      if(!email || !name){
           throw new CustomError.BadRequestError('Please provide all values')
   }
   const user = await User.findOne({_id:req.user.userId})
   user.email = email
   user.name = name
   await user.save()
   const userToken = createTokenUser(user)
       attachCookiesToResponse({res, user:userToken})
       res.status(StatusCodes.OK).json({user:userToken})
}



const updateUserPassword = async ( req,res) =>{
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide old and new password')
    }
    const user = await User.findOne({_id:req.user.userId})
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if(!oldPassword === isPasswordCorrect){
        throw new CustomError.UnauthorizedError('Please provide valid password')
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg: 'Password updated succesfully !!'}) 

}


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

//     UPDATE USER WITH findOneAndUpdate
//const updateUser = async ( req,res) =>{
 //   const {name,email} = req.body
 //   if(!email || !name){
 //       throw new CustomError.BadRequestError('Please provide all values')
 //   }
  //  const user = await User.findOneAndUpdate({_id:req.user.userId},{email,name},{new:true,runValidators:true})
 //   const userToken = createTokenUser(user)
 //   attachCookiesToResponse({res, user:userToken})
 //   res.status(StatusCodes.OK).json({user:userToken})
//}