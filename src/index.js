import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path:'./.env'
})
connectDB().then(()=>{
    app.on("error",(error)=>{
       console.log("ERROR!",error);
       throw error;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed!!",err);
})


/*
import express from "express";
const app=express();
dotenv.config()
const app=express();
// iifee means execute it immediately
const connectDB= ( async ()=>
    
    {
        try{
               await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)

               app.on("error",(error)=>{
                console.log("err:",error);
                throw error;
               })
               app.listen(process.env.PORT,()=>{
                console.log(`app is listnening on port ${process.env.PORT}`)
               })
        }
        catch(err){
            console.log(" error occured while connection database",err)
            throw err;
        }
    }
)()
    */

