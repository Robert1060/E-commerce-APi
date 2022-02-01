const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide name'],
        minlength:3,
        maxlength:40
    },
    email:{
        type:String,
        unique:true,
        required:[true, 'Please provide email'],
        validate:{
            validator:validator.isEmail,
            message:'Please provide valid email',
           }
    },
    password:{
        type:String,
        required:[true,'Please provide password'],
        minlength:5,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    }

})
userSchema.pre('save', async function(){
   // console.log(this.modifiedPaths());
   // console.log(this.isModified('name'));
    if(!this.isModified('password')) return 
   const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})
userSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = new mongoose.model('User', userSchema)