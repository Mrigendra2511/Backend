// it verifies ki user hai ya nahi
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asynchandler.js";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer","")// replace krdiya bearer token ko empt string
     if(!token){
        throw new ApiError(401,"unauthorized request");
        
    }
    //  data ko decrypt karenge
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
        throw new ApiError(401,"invalid accessTOken")
     }
    // ab agar humare pass confirmation aagyi hai ki user hai hi to hum req ke andar new object add karenge
    req.user=user;
    next();
    } catch (error) {
        throw new ApiError(401, error?.message||"Inavalid accessToken")
    }
})