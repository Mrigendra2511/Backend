import mongoose,{Schema, SchemaTypes} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate"

/*Comment: create getVideoComments, updateComment, deleteComment
 */
const commentSchema=new Schema(
    {
content:{
    type:string,
    required:true
},
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
   

}, {
        timestamps:true
    }
)

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment=mongoose.model("Comment",commentSchema)