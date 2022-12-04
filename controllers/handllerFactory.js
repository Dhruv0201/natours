const APIfeatures=require('./../utils/apiFeatures');

exports.getAll=Model=>async (req,res)=> 
{
    //to allow nested tour reviews
    let filter;
    if(req.params.tourId) filter={tour:req.params.tourId};

    const features=new APIfeatures(Model.find(filter),req.query).filter().sort().limit().pagination();
    const docs=await features.query;
    try{
        // const tours=await Tour.find(queryobject);
        res.status(200)
        .json(
            {
                data:docs
            }
        )
    }
    catch(error)
    {
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Something Went Wrong"
        })
    }
}

exports.deleteOne = Model =>
    async (req, res,next) => {
        try{
            await Model.findByIdAndDelete(req.params.id)
            res.status(204).json({
              status: 'success',
              data: null
            });
          } catch (err) {
            res.status(404).render('error',{
                title:'Something Went Wrong',
                msg:"Oops! Error Occured"
            })
        }
         next()
    }
exports.updateOne=Model=>async (req,res)=>
    {
        try{
            const doc= await Model.findByIdAndUpdate(req.params.id,req.body,
                {
                    new:true,
                    runValidators:true
                });
            
            res.status(200)
            .json(
                {
                    data:doc
                }
            )
        }
        catch(error)
        {
            res.status(404).render('error',{
                title:'Something Went Wrong',
                msg:"Error in Updating"
            })
        }
    }
exports.createOne=Model=>async (req,res)=>
{
    try{
        const newDoc=await Model.create(
            req.body
        )
        res.status(201)
        res.json(
            {
                status:"added data!",
                data:
                {
                    data:newDoc
                }
            }
        )
    }
    catch(err)
    {
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"Invalid Request"
        })
    }
}
exports.getOne= (Model,populateOptions) => async (req,res)=> 
{
    try{
        let query=Model.findById(req.params.id);
        if(populateOptions) query=query.populate(populateOptions);
        const doc=await query;
        if(doc)
        {
            return res.status(200)
            .json(
                {
                    data:doc
                }
            )
        }
        else
        {
            res.status(404).render('error',{
                title:'Something Went Wrong',
                msg:"There is No Document With Such ID"
            })
        }
        
    }
    catch(error)
    {
        res.status(404).render('error',{
            title:'Something Went Wrong',
            msg:"There is No Document With Such ID"
        })
    }
}