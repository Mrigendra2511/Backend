import { Like } from "../models/like.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asynchandler";

const toggleVideolike=asyncHandler(async(req,res)=>{
    const{videoId}=req.params;
    const{user}=req.user._id;
    if(!videoId){
        throw new ApiError();
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError("")

    }
    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await existingLike.deleteOne()
    }
    else{
        await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })
    }
    // Response add karna hai
return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video liked/unliked successfully"))

})

const toggleCommentLike=asyncHandler(async(req,res)=>{
      const{commentId}=req.params;
      if(!commentId){
        throw new ApiError();
      }
    const  comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError("");

    }

    const isLikedBy=await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    if(isLikedBy){
     await isLikedBy.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment unliked successfully"))
    }
    else{
        await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })
        return 
        res.status(200)
        .json(new ApiResponse(200, {}, "Comment liked successfully"))
    }
    
})

const getLikedVideos=asyncHandler(async(req,res)=>{

    // const likedVideos=await Like.findOne({
    //     video:{$exists:true,$ne:null},
    //     likedby:req.user?._id
    // })
    const likedVideos=await Like.aggregate([{
        $match:{
            video:mongoose.Types.ObjectId(req.user?._id),
            video:{$exists:true,$ne:null}
        }
    },{
    $lookup: {
        from:" videos",
        localField:"video",
        foriegnField:" id",
        as:" videodetails",
        pipeline:[{
            $project:{
                owner:1,
                title:1,
                thummbnail:1,
                views:1,
                createdat:1

            }

        }]

    }},{
        $addFields:{
            video:{
                $first:"videodetails"
            }
        }
    },{
        $project:{
            _id:0,
        }
    }
    ])

    // const likedVideos=await Like.aggregate([
    //     {
    //         $match:req.user?._id
    //     },
    //     {
    //         $lookup:{
    //             from:" likes",
    //             localField:"likedby ",
    //             foriegnField:" user_id"
    //         }
    //     }
    // ])
    
})
export {toggleCommentLike,toggleVideolike,getLikedVideos}