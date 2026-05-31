import express from "express"
import cors from "cors"
// cookies ka kaam hai mai mere server se user ki cookies access kar pau and cred operations kar pau
import cookieParser from "cookie-parser";


const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))
app.use(express.json({
    limit:"16kb",
}))
// it encodes the url
// extended-objects ke andar objects dena
app.use(express.urlencoded
    ({extended:true,limit:"16kb"}))
    // to kkeep assets,photos
app.use(express.static("public"))
app.use(cookieParser())

// router import
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)
export { app }
