
const util = require('util')
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Email = require('../utils/email')

// const sendmail = require('../utils/email')
// const sendEmail = require('./../utils/email');
const crypto = require('crypto')
const {Document} = require("mongoose")
const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXP_IN
    })
}

const CreateSendToken = async (user,statusCode,res) =>{
    const token = signToken(user._id)
    const coockieOption = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXP_IN*24*60*60*1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV ==='production') coockieOption.secure = true;
    return res.cookie('jwt',token,coockieOption).status(statusCode).json({
        status: "success",
        token,
        data:{
            user
        }
    })
    
}
    exports.signup = async (req,res,next) =>{
        // console.log("jsdv")
       try{ const newUser = await User.create(
        {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    
       }
       );
       const url= `${req.protocol}://${req.get('host')}/me`
    //    console.log(url)
       await new Email (newUser,url).sendWelcome()
       CreateSendToken (newUser,201,res);
        
       }
       catch (err) {
       return res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Cant Sign Up"
        })
      }
    
    }
    exports.login = async function (req,res,next){
        const { email, password } = req.body;

  // 1) Check if email and password exist
  try {if (!email || !password) {
    res.status(404).render('error',{
        title:'Something Went Wrong',
        msg:"Please Provide Both Email and Password"
    })
}

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))    {
   return res.status(400).json(
        {
            status:"fail",
            detail:"incorrect user or password"
        }
    )
   
}


        CreateSendToken(user,200,res)
    }


catch(err)
    {
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Please Login Again"
        })
    }
}

exports.logout = async (req,res,next) =>{
    try{
        res.cookie('jwt',"loggedout",{
            expires: new Date(Date.now +10*1000),
            httpOnly:true
        }
        )
        return res.status(200).json({status: "success"})

    }
    catch(err){
        res.send(err)
    }
}

    exports.protect = async (req,res,next) => {
        try{
            //console.log("in protect");
            // getting the token from the header of http request
            let token;
            if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
            {
                token=req.headers.authorization.split(' ')[1];
            }
            else if (req.cookies.jwt){
                token=req.cookies.jwt
            }
            // console.log(token);
            if(!token)
            {
                return res.status(404).render('error',{
                    title:'Something Went Wrong',
                    msg:"You Are Not Logged In"
                })
                    
            }
            //veryfying token
            const decoded=  jwt.verify(token,process.env.JWT_SECRET);
            //console.log(decoded);
            //check if the user exist:
            const currentUser= await User.findById(decoded.id);
            if(!currentUser)
            {
                res.status(404).render('error',{
                    title:'Cant Find User',
                    msg:"There is No User With Such eamil"
                })
               
            }
            // check if the user has changed the password or not:
            // if(currentUser.ispasswordChanged(decoded.iat))
            // {
            //     return res.json(
            //         {
            //             detail:"recentyl changed password please login again"
            //         }
            //     )
    
            // }    
            // //grant access to protected route----
            req.user=currentUser;
            res.locals.user=currentUser
            next();
        }
        catch(err)
        { 
            res.status(404).render('error',{
                title:'Something Went Wrong',
                msg:"Not Logged In"
               
            })
    }
}
exports.isLoggedIn = async (req,res,next) => {
    try{
         if (req.cookies.jwt){
            const decoded=  jwt.verify(req.cookies.jwt,process.env.JWT_SECRET);
            //console.log(decoded);
            //check if the user exist:
            const currentUser= await User.findById(decoded.id);
            if(!currentUser)
            { return next()  
            } 
            res.locals.user=currentUser
            return next()
        }
        next();
    }
    catch(err){
        return next()
    }
}
    

exports.restrictTo = (...roles) => {
    return (req,res,next )=>{
        if(!roles.includes(req.user.role)){
              res.json( 
                    {
                        status:'fail',
                        detail:"not authorized" })
            
        }
         next()
    }
}
exports.forgotPassword = async (req,res,next)=>{
    const finduser = await User.findOne({email:req.body.email})
    if(!finduser){
        res.status(403).json( 
                    {
                        status:'fail',
                        detail:"There is No user with this email id" })
            next()
    }

    const resetToken = finduser.createResetPasswordToken()
    await finduser.save({validateBeforeSave:false})
    // console.log(resetToken);
    try{
        const resetURL= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
      
        await new Email (finduser,resetURL).sendresetPassword()
        res.status(200).json({
            status:"Success"
        })

    }
    catch(err)    {
        finduser.passwordResetToken=undefined;
        finduser.resetTokenExpiry=undefined;
        finduser.save({validateBeforeSave:false});
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"There is Some Error in Sending Mail"
        })
    }
    next()
}

exports.resetpassword=async (req,res,next)=>
{
 try   {    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({passwordResetToken:hashedtoken,passwordResetExpires:{$gt: Date.now()}})
        if(!user){
            return res.status(400).json({Detail:"the token is incorrect or has expired"})
            

        }
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()
        CreateSendToken(user,200,res)
      
    next();}
    catch(err)
    {
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Issue In Setting Password"
        })
        next();
    }

}
exports.updatePassword = async function (req,res,next) {
    console.log("SDvsDCV")
    try {const user = await User.findById(req.user.id).select('+password');
    

    if(!(await user.correctPassword (req.body.CurrentPassword,user.password))){
        return res.status(400).json({
            status:'Current Password is Wrong'
        }
        )
    
    }
    user.password = req.body.password,
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    CreateSendToken(user,200,res)
}
    catch(err){
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Issue In Reseting Password"
        })
         
      
    }

}