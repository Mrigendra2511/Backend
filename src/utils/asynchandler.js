const asyncHandler=(requesHandler)=>{
  return (req,res,next)=>{
     Promise.resolve(requesHandler(req,res,next)).catch((err)=> next(err))
   } 
}

export {asyncHandler}

// const asyncHandler=(fn)=>async(res,req,next)=>{
// try {
//     await fn(req,res,next);
    
// } catch (error) {
//     res.status(error.code||500).json({
//         message:error.message
//     })
    
    
// }
// }

