// database is always in another continent maybe it can be in so we will use try catch and async await because it takes time
import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB=async ()=>{
    try{
        console.log("MONGO_URI =", process.env.MONGO_URI);
    const connectionInstance=  await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`)
    //  console.log(connectionInstance)
    // to know we are connected to which port
    console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MONGODB connection error occured",error);
        process.exit(1);
    }
}
export default connectDB