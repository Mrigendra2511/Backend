import { asyncHandler } from "../utils/asyncHandler.js"
import { subscription, Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const toggleSubscription=asyncHandler(async(req,res)=>{
    // channel id lo nahi aaye to throw error
    // db mein match  nhi mile to error
    // self subscribe check karo
    // if subscibed to delete vrna create kardo
    const{channelId}=req.params;
    if(!channelId){
        throw new ApiError(400," channel Id is missing")

    }
    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(400," channel does not exists")
    }
    // const user=await User.findById(req.user?._id)
    // if(!user){
    // throw new ApiError(400," User is required")

    // }
    if(req.user?._id.toString()===channelId.toString()){
        throw new ApiError(400,"u cannot subscribe to your own channel ")
    }
   const subscription=await  Subscription.findOne({
        channel:channelId,
        subscriber:req.user?._id
    })
    if(subscription){
        await subscription.deleteOne()
       
        return res.status(200).json(new ApiResponse(200,{}," User has Unsubscribed to channel"))

            }

        await  Subscription.create({
        channel:channelId,
        subscriber:req.user?._id
        })
 return res.status(200).json(new ApiResponse(200,{}," User has subscribed to channel"))

        }

)

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,"channel ID is  required ");
        
    }
    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"channel is not found");
    }
    // using populate
//    const subscriptions= await Subscription.findOne({
//         channel:channelId,
//         subscriber:req.user?._id
//     }).populate({
//        path:subscriber,
//        select:( " fullbname avatar username")

//     })
    // const subscribersList=subscriptions.map((sub)=>sub.subscriber)

// using aggregation 
   const subscriptions= await Subscription.aggregate([{
       $match:{
        channel:mongoose.Types.ObejctId(channelId)
    },$lookup:{
        from:"users",
        localField:" subscriber",
        foreignField:"_id",
        as:" subscriberDetails",
        pipeline:[
            {
            $project:{
                fullname:1,
                avatar:1,
                username:1
            }
            
        }
    ]
    }

    },{
        $addFields:{
            subscriber:{
                $first:"$subsciberDetails"
            }
        }
    },
    {
        $project:{
            _id:0,
            subscriber:1
        }
    }
])
return res.status(200).
json( new ApiResponse(
                200,
                subscribers,
                "Subscribers fetched successfully"))

})
 
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const user = req.user?._id
    if (!user) {
        throw new ApiError(401, "Unauthorized request")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        // $addFields aage aayega
    ])
})

export{ toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers}