const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true, 'Please provide product name'],
        maxlength:[50,'Name cannot be more than 50 characters']
    },
    price:{
        type:Number,
        required:[true,'Please provide product price'],
        default:0

    },
    description:{
        type:String,
        required:[true,'Please provide product description'],
        maxlength:[500,'Description can not be more than 500 characters']
    },
    image:{
        type:String,
        required:[true,'Please provide product image'],
        default:'/uploads/example.jpeg'
    },
    category:{
        type:String,
        required:[true,'Please provide product category'],
        enum:['office','kitchen','bedroom']
    },
    company:{
        type:String,
        required:[true,'Please provide product company'],
        enum:{
            values:['ikea','liddy','marcos'],
            message:'{VALUE} is not supported'
        }
    },
    colors:{
        type:[String],
        default:['#222'],
        required:[true,'Please provide Product colors'],

    },
    featured:{
        type:Boolean,
        default:false
    },
    freeShipping:{
        type:Boolean,
        default:false
    },
    inventory:{
        type:Number,
        required:true,
        default:15
    },
    averageRating:{
        type:Number,
        default:0
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true

    }
},
    {timestamps:true, toJSON:{virtuals:true},toObject:{virtuals:true}} 
   )

    productSchema.virtual('reviews',{
        ref:'Review',
        localField:'_id',
        foreignField:'product',
        justOne:false,

    })

    productSchema.pre('remove', async function() {
       await this.model('Review').deleteMany({product:this._id})
    })


   module.exports = mongoose.model('Product',productSchema)