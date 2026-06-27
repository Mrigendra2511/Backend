import mongoose,{Scehma} from "mongoose";

const subscriptionScehma=new Schma({
    subsciber:{
        type:Schema.Types.ObjectId,// peroson who is subscribing
        ref:"User"
    },
    channel:{
         type:Schema.Types.ObjectId,// channel which is being subscribed
        ref:"User"
    }
    
    
},{timestamps:true})

export const subscription=mongoose.model("Subscription",subscriptionScehma)

