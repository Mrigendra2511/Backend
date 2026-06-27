import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asynchandler";


const userComment=asyncHandler(async(req,res)=>{
    const {videoId}= req.params;
    const {content}=req.body;
    if(!videoId){
        throw new ApiError(400," video is required")
    }

    if(!content?.trim()){
    throw new ApiError(400," content is required")
 }
 const video=await Comment.findById(videoID);
 if(!video){
      throw new ApiError(400," invalid id")
  }

  const createComment=await Comment.create({
    content,
    video:videoId,
    owner:req.user?._id
  })
  return res.status(200)
  .json(200,createComment,"comment created successfully");
})



const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true
        }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

const deleteUserComment=asyncHandler(async(req,res)=>{
    const{commentId}=req.params;
    if(!commentId){
        throw new ApiError(400," invalid comment")

    }
    const comment=await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400," no comment found")
        }

        if(comment.owner.toString()!=req.user?._id.toString()){
            throw new ApiError(400, "Invalid User")
        }
      await  comment.deleteOne()
    return res.status(200).json(new ApiResponse(200,{}," comment deleted successfully"));
})
export{ userComment,getVideoComments,updateUserComment,deleteUserComment}