import { createConnection } from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";


const generateAcessandRefreshTokens= async(userId)=>{
  try {
   const user = await User.findById(userId)
  const accessToken= user.generateAcessToken()
   const refreshToken=user.generateRefreshToken()
   user.refreshToken=refreshToken
  await user.save({validateBeforeSave:false}) //sidha save kardo validation mat chalao

  return{accessToken,refreshToken}// it generates access token
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating tokens")
    
  }

}
// User mongoose ka object hai 
const registerUser=asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation-not MPT
    // check if user already exists
    // check avatar file and cover image file
    // ?upload on cloudinary
    // create user object
    // remove password amd refreshtokenfield
    // check for user createConnection
    // return response

const{fullname,email,username,password}=req.body;
console.log("email",email);

if (
    [fullname,email,username,password].some((field)=>field?.trim==="")
) {
    throw new ApiError(400,"all fields are required");
}


const existedUser=await User.findOne({
    $or:[{ username },{ email }]
})

if(existedUser){
    throw new ApiError(409," user already exists")
}
conso
le.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path;
//    const coverImageLocalPath =req.files?.coverImage[0].path;
   let coverImageLocalPath;

   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
     {
        coverImageLocalPath=req.files.coverImage[0].path
     } 

   if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")

   }
   const avatar=await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"avatar file is required")
   }
//    how to enter database, user humara database se baat kr rha hai
  const user=  await User.create({
        fullname,
        avatar:avatar.url,
        // hume check krna hai ki coverImage hai ya nahi kyunki ye compulsary nahi hai
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.tolowerCase()
     })
    //  mongodb har 1 data ke sath 1 id create kar deta hai
     const createdUser=await User.findById(user_.id).select(
        // -minus sign lagake hum fields ko remove kar sakte h
        "-password -refreshToken"
     )
     if(!createdUser){
        throw new ApiError(500,"something went wrong while registering for user");
     }
     return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
     )

})

const loginUSer= asyncHandler( async (req,res)=>{
    // req body se data le aao
    // check username or email
    // find the user
    // check password
    // access and refresh token generate karo or user ko bhejo
    // send secure cookies
    // response that user is login

    const {email,username,password}=req.body
// checking for both
    if(!username || !email){
        throw new ApiError (400," username or email is required")
    }
    const user=await User.findOne(
        {
            $or:[{username}, {email}]
        }
    )
if(!user){
    throw new ApiError(404,"user does not exist")
}
// pass check
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError (401," Incorrect password")
    }

const {accessToken,refreshToken}=await generateAcessandRefreshTokens(user._id)
 const loggedInUser=await loggedInUser.findById(user._id)
 .select("-password-refreshToken")

//  by default koi bhi frontend se cookies ko modified kar sakta hai but usko secure karke hum bas server se usko modifiable banate hai
 const options={
    httpOnly:true,
    secure:true
 }
 return res.status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
    new ApiResponse(
        200,{
            user:loggedInUser,
            accessToken,
            refreshToken
        },
        "user loggedIn successfully"
    )
 )

})
// for logout user ko find karo
const logoutUser=asyncHandler(async(req,res)=>{
User.findByIdAndUpdate(
    req.user>_id,{
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)
const options={
    httpOnly:true,
    secure:true
}
return res.status(200)
.clearCookie("accesToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{}," User logged Out"))
})


export{registerUser,loginUSer,logoutUser}
