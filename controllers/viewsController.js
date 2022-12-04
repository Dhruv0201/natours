const Tour = require('../models/tourModel');
const User = require('../models/userModel');


exports.getOverview = async(req, res) => {
    const tours = await Tour.find()
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
};
exports.getTour = (async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
   try { const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    }).populate({
        path:'guides',
        fields:'name email photo'
    });
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
      });
  }
catch (err){
    return res.status(404).render('error',{
        title:'Something Went Wrong',
        msg:"There is No Tour With Such Name"
    })
}
});
  exports.getlogin= (req,res,next) =>{
    res.status(200).render('login',{
        title:'Log in'

    })
  }
exports.getAccount = (req,res,next)=>{
    res.status(200).render('account',{
        title:"Your Account"
    })
    
}
exports.updateuserdata = async (req,res,next)=>{
    try {const updateduser = await User.findByIdAndUpdate(req.user.id,{
        name:req.body.name,
        email:req.body.email
    },
    {
        new:true,
        runValidators:true
    })
    res.status(200).render('account',{
        title:"Your Account",
        user:updateduser
    })
}
    catch(err){
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:'error Occured'
        })
    }
}