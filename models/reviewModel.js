const mongoose=require('mongoose');
//const StreamTransport = require('nodemailer/lib/stream-transport');
// const Tour = require('./tourModel')
const Tour=require('./tourModel');

const reviewSchema=mongoose.Schema(
    {
        review:{
            type:String,
            required:[true,'review cannot be empty']
        },
        rating:
        {
            type:Number,
            min:1,
            max:10,
            required:[true,'rating needed']
        },
        createdAt:
        {
            type:Date,
            default:Date.now
        },
        tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true,'a review must have a tour']
        },
        user: {
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'review must have a user']
        }
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)



reviewSchema.pre(/^find/,function(next)
{
    this.populate(
            {
                path:'user',
                select:'name'
            });
    next();
})

reviewSchema.pre(/^find/, function(next) {
    this.populate({
    path: 'user',
    select: 'name photo'
    })
    next()
})

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.statics.calcAverageRating=async function(tourId)
{
    const stats=await this.aggregate(
        [
            {
                $match:{tour:tourId}
            },
            {
                $group:{
                    _id:'$tour',
                    nRating:{$sum:1},
                    avgRating:{$avg:'$rating'}
                }
            }
        ]
    );
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: 0,
          ratingsAverage: 4.5
        });
      }
}
reviewSchema.index({ tour:1,user:1 },{unique:true})
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRating(this.tour);
  });
  
  // findByIdAndUpdate
  // findByIdAndDelete
  reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  
  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
  });

const Review=mongoose.model('Review',reviewSchema);

module.exports=Review;