const errorHandler = (err,req,res,next)=>{
    const statusCode= err.statusCode?err.statusCode:500;
   
    switch (statusCode){
        case 400:{
             res.status(400)
            res.json({
                type:" Validation failed",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
        case 401:{
            res.status(401)
            res.json({
                type:" UnAuthorized ",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
        case 403:{
             res.status(403)
            res.json({
                type:" Forbidden Error",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
        case 404:{
             res.status(404)
            res.json({
                type:" Not Found",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
        case 500:{
             res.status(500)
            res.json({
                type:" server Error",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
        default:{
             res.status(500)
            res.json({
                type:" server Error",
                message:err.message,
                errorStack:err.stack
            })
            break;
        }
    }
} 

module.exports=errorHandler;