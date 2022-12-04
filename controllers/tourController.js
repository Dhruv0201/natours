const fs = require('fs');
const Tour = require("./../models/tourModel")
const APIfeatures = require("../utils/apiFeatures")
const factory = require('../controllers/handllerFactory')
exports.top5tour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
}
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour,{path:'reviews'}) 


exports.createTour = factory.createOne(Tour)
// console.log(req.body);


exports.updateTour =factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
exports.getTourStats = async (req,res) =>{
  try{
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage : {$gte : 4.5}}
      },
      {
        $group :{
          _id:'$'+req.params.statParams,
          numTours:{ $sum : 1},
          avgRating:{$avg:'$ratngsAverage'},
          avgPrice : {$avg:'$price'},
          minprice : {$min:'$price'},
          maxprice : {$max:'$price'}
        }
      },
      {
        $sort:{ avgPrice : 1}
      }

    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
  }
  catch(err) {
    res.status(404).render('error',{
      title:'Something Went Wrong',
      msg:"There is Some Error Try Again Letter"
  })
  }
}
exports.monthlyPlan = async (req,res)=>{
  try{
    const year = req.params.year * 1;
    const montlydata = await Tour.aggregate([
      {
        $unwind:'$startDates'
      },
      {$match:{
        startDates:{
          $gte : new Date(`${year}-01-01`),
          $lte:  new Date(`${year}-12-31`)
        }
      }},
      {$group:{
        _id:{$month : '$startDates'},
        numofTours:{$sum : 1},
        tours :{$push : '$name'}
      }},
      {
        $addFields:{
          month :'$_id'
        },
      },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            _id: 0
          }
        }
      
    ]);
    res.status(200).json({
      status: 'success',
      numerofResults:montlydata.length,
      data: {
        montlydata
      }
    });

  }
  catch(err){
    res.status(404).render('error',{
      title:'Something Went Wrong',
      msg:"Something Went Wrong try again letter"
  })
  }
}
// '/tours-within/:distance/center/:latlng/unit/:unit'
exports.getTourWithin= async (req,res,next) =>{
 try {const {distance,latlng,unit} = req.params
  const [lat,lng] = latlng.split(',')
  console.log(lat,lng,distance)
  if(!lat || !lng){
    res.status(404).json({
      message:'Please Provide lat lng'
    })
  }
  const radius = unit==='mi'? distance/3963.2 : distance/6378.1
  const tour = await Tour.find({ startLocation: {$geoWithin : { $centerSphere : [[lng,lat],radius ]}} })
  res.status(200).json({
    status:'Success',
    NumberoFTOurs:tour.length,
    data:{
      tour
    }
  })
  
}
catch(err){
  res.status(404).render('error',{
    title:'Something Went Wrong',
    msg:"Something Went Wrong try again letter"
})
}
}
exports.getdistance= async (req,res,next) =>{
  try{
    const {latlng,unit} = req.params
    const [lat,lng] = latlng.split(',')
    console.log(lat,lng)
    if(!lat || !lng){
      res.status(404).json({
        message:'Please Provide lat lng'
      })
    }
    
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  }

  catch(err){
    res.status(404).render('error',{
      title:'Something Went Wrong',
      msg:"Something Went Wrong try again letter"
  })
  }
}