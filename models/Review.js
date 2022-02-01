const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    rating:{
        type:Number,
        required:[true, 'Please provide review rating'],
        min:1,
        max:5,
        default:0
    },
    title:{
        type:String,
        tirm:true,
        required:[true,'Please provide review title'],
        maxlength:[40,'Title can not be more than 40 characters']
    },
    comment:{
        type:String,
        required:[true,'Please provide a comment'],
        maxlength:[150,'Comment can not be more than 150 characters']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    product:{
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required:true
    }
},
{timestamps:true}
)

reviewSchema.index({product:1,user:1},{unique:true})

reviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate([
        {$match:{product:productId}},
        {$group:{
            _id:null,
            averageRating:{$avg:'$rating'},
            numOfReviews:{$sum:1}
        }}
    ])
    try {
        await this.model('Product').findOneAndUpdate({_id:productId},{
            averageRating:Math.ceil(result[0]?.averageRating || 0),
            numOfReviews:result[0]?.numOfReviews || 0
        })
    } catch (error) {
        console.log(error);
    }
}

reviewSchema.post('save',async function(){
    await this.constructor.calculateAverageRating(this.product)
})

reviewSchema.post('remove',async function(){
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = new mongoose.model('Review',reviewSchema)