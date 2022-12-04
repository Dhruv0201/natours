const User = require('../models/userModel');
const factory = require("../controllers/handllerFactory")

// const catchAsync = require(' ./../ utils/catchAsync');

  const filterObj = (obj,...allowedfields)=>{
    const newobj = {}
    Object.keys(obj).forEach(el =>{
      if(allowedfields.includes(el)) newobj[el] = obj[el]
    })
    return newobj;
  }
exports.getMe = (req,res,next) =>{
  req.params.id = req.user.id
  next()
}
exports.getAllUsers = factory.getAll(User)

exports.updateMe = async (req,res,next) =>{
  try{
    if(req.body.password || req.body.passwordConfirm){
      return res.status(400).json({
        message:"you can not change password"
      })
    }

    const filterbody = filterObj(req.body,'name','email')
    const updateduser = await User.findByIdAndUpdate(req.user.id,filterbody,{new:true,runValidators:true})
    res.status(200).json({
      status:'success',
      data:{
        user:updateduser
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
exports.deleteme = async (req,res,next)=>{
 await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(200).json({
    status:"success",
    Userdata:{
      user:null
    }
  })
}

exports.getUser = factory.getOne(User)
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
