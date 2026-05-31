import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const UserSchema= new mongoose.Schema(
    {
        username :{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,

        },
        password:{
            type:String,
            required:[true,"password is required"],
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
             type:String,
             required:true
        },
        coverImage:{
        type:String

        },
        watchHistory:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }],
        password:{
            type:String,
            required:[true," Password is required"]
        },
        refreshToken:{
            type:String
        }
    },{timestamps:true})




const TodoSchema=new mongoose.Schema(
    {
                           
    }
    ,{timestamps:true})
// encryption takes time becaause is it is complex so It is written as async function
    UserSchema.pre("save", async function (next)
    {
        if(!this.isModified("password")) return next();
        this.password=await bcrypt.hash(this.password,10)
        next();
    })

    UserSchema.methods.isPasswordCorrect= async function(password)
    {
     return await  bcrypt.compare(password,this.password)

    }
    UserSchema.methods.generateAcessToken=function(){
       return jwt.sign({
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullName
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    }
    
    UserSchema.methods.generateRefreshToken=function(){
         return jwt.sign({
            _id:this._id,
        }, process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    }
export const User=mongoose.model("User",UserSchema)

/*
1. Video Summary
Concise Summary: Is video mein instructor ne ek video-sharing platform (jaise YouTube) ka backend database blueprint (Models) banaya hai. Unhone User aur Video ke models Mongoose ka use karke banaye hain. Sath hi, user ke password ko secure karne ke liye bcrypt aur login maintain karne ke liye JWT (JSON Web Token) ka use kiya hai
.
Main Goal: Video ka main goal ye sikhana hai ki production-level pe database models kaise design hote hain, passwords ko database mein plain text mein kyu nahi rakhte, aur tokens (Access aur Refresh) kaise generate kiye jaate hain
.
2. Key Concepts
Mongoose Schema & Model: Schema ek blueprint hota hai jo batata hai ki database mein data kaisa dikhega (kaunsi field string hogi, kaunsi number). Model us blueprint ka use karke actual data create karta hai
.
Indexing (index: true): Jab database bohot bada ho jata hai, toh search fast karne ke liye hum kuch fields ko 'index' kar dete hain. Ye database ki searching ko highly optimize kar deta hai
.
Pre Hooks (Middleware): Ye Mongoose ka ek feature hai. Database mein data save hone se theek pehle (ya delete hone se pehle) agar hume kuch action perform karna hai, toh hum 'pre' hooks ka use karte hain
.
Bcrypt: Ye ek library hai jo humare normal password (jaise '1234') ko ek complicated secret code (hash) mein convert kar deti hai, taaki agar database hack bhi ho jaye, toh password kisi ko samajh na aaye
.
JWT (JSON Web Token): Ye ek digital ID card (bearer token) hai. Jab user login karta hai, toh server usko ek JWT de deta hai. Agli baar user jab bhi aayega, wo ye token dikhayega aur server usko pehchan lega
.
Aggregation Paginate: Ye ek Mongoose plugin hai jo complex queries likhne aur data ko pages mein divide (pagination) karne mein madad karta hai
.
3. Detailed Explanation (Section by Section)
Setting up User Model: Instructor ne User schema banaya jisme fields hain: username, email, fullName, avatar, coverImage, watchHistory (jo doosre video objects ka array hai), password, aur refreshToken
.
Setting up Video Model: Video schema mein videoFile, thumbnail, title, description, duration, views, isPublished, aur owner (jisne upload kiya) banaya gaya hai
. Inmein images aur videos AWS ya Cloudinary jaisi 3rd party service pe upload hoti hain, aur database mein sirf unka URL (String) save hota hai
.
Using Plugins: Video schema mein ek plugin inject kiya gaya mongoose-aggregate-paginate-v2 taaki aage chal kar hum advance level ki MongoDB queries (aggregation pipelines) likh sakein
.
Securing Passwords (Hooks): Password ko plain text me rakhna safe nahi hai. Isliye instructor ne pre('save') hook ka use karke usko encrypt kiya hai
. Unhone ek isModified condition bhi lagayi taaki password sirf tabhi encrypt ho jab wo naya banaya gaya ho ya change kiya gaya ho, warna har baar profile update karne pe password change ho jayega
.
Custom Methods (JWT & Password Check): Schema ke andar hum apne custom functions bana sakte hain. Instructor ne 3 methods banaye
:
isPasswordCorrect: Jo user ke enter kiye hue password ko encrypted password se compare karta hai
.
generateAccessToken: Jo ek short-lived JWT token banata hai user details (payload) ke sath
.
generateRefreshToken: Jo ek long-lived token banata hai jisme sirf user ki ID hoti hai
.
4. Beginner-Friendly Breakdown
Socho aap ek bohot bade VIP Club (Backend System) ke manager ho.
Mongoose Schema: Ye club ka Admission Form hai. Form pe pehle se likha hota hai "Yahan sirf Name (String) aayega, Yahan Email aayega".
Bcrypt: Agar koi VIP apna password form pe likhta hai, toh aap nahi chahte ki club ka koi staff usko padh le. Toh Bcrypt ek 'Secret Agent' hai jo us password ko us form par likhne se thik pehle ek aisi ajeeb language mein badal deta hai jo koi nahi samajh sakta.
Mongoose Pre-Hook: Ye admission counter ke theek bahar khada Guard hai. Jaise hi form andar (database mein) aane wala hota hai, ye guard "Pre" (pehle) hi form ko pakadta hai, Secret agent (Bcrypt) ko bulata hai aur password ko change karwa ke tab andar jane deta hai.
JWT (JSON Web Token): Ab VIP andar aa gaya. Par kya wo baar-baar gate pe aake apna naam aur password batayega? Nahi! Hum usko ek VIP Wristband (JWT Token) de dete hain. Jab tak wo wristband pehna hai, use seedha entry milegi. Isko 'Bearer Token' bhi kehte hain, yaani jiske paas bhi ye (Bear karne wala) hai, usko entry milegi
.
5. Technical Terms
Mongoose: Ek ODM (Object Data Modeling) library jo Node.js aur MongoDB ke beech ek bridge ka kaam karti hai.
Payload: Token (JWT) ke andar jo user ka main data chupa hota hai (jaise uska email, id), use payload kehte hain
.
Bearer Token: Ek aisa token jisko hold karne wale ko bina password ke access mil jata hai
.
Secret Key: Ek lamba, complex text jo JWT token banane aur usko verify karne ke kaam aata hai. Iske bina koi nakli token nahi bana sakta
.
Next(): Express/Mongoose middleware mein ek function jo batata hai ki "mera kaam ho gaya, ab code aage (next step pe) jane do"
.
6. Real-World Applications
Ye exact same concepts aaj ki har badi application use karti hai!
Netflix / YouTube: Jab aap apne phone mein ek baar login karte ho, toh mahino tak logged in rehte ho. Kyun? Kyunki backend ne aapko ek JWT Refresh Token de rakha hai jo lambe time tak chalta hai, aur wo backend se automatically Access Token mangwata rehta hai
.
E-commerce (Amazon): Jaha par bhi aap user ka password mangte hain, wahan humesha Mongoose hook + Bcrypt use karke usko database me hash karke save kiya jata hai taaki Amazon ke developers bhi apka original password na jaan sakein.
7. Common Interview Questions
Q1: Mongoose Hooks mein hum arrow functions (=>) kyu use nahi karte? Answer: Arrow functions ke paas apna khud ka this context nahi hota. Mongoose hooks mein hume this ka use karke current document (jaise current user) ka data (password, email) access karna hota hai. Normal function() likhne se hume us object ka this mil jata hai
.
Q2: JWT mein Access Token aur Refresh Token mein kya difference hai? Answer: Access Token short-lived hota hai (jaise 1 din ya 15 minute) aur isme user ka main data hota hai. Refresh Token long-lived hota hai (jaise 10 din) aur isme data kam hota hai (sirf ID). Jab Access token expire ho jata hai, toh hum Refresh token ka use karke naya Access token laate hain, taaki user ko bar-bar login na karna pade
.
Q3: Password hash karte time isModified check lagana kyu zaroori hai? Answer: Agar hum ye nahi lagayenge, toh jab bhi user apni profile mein kuch bhi (jaise naam ya photo) update karega, Mongoose pre('save') chala dega aur already hashed password ko dobara encrypt kar dega, jisse user ka password permanently corrupt ho jayega aur wo kabhi login nahi kar payega
.
8. Practice Questions
Easy: Mongoose me Schema aur Model me kya antar hai?
Medium: Bcrypt library ka bcrypt.compare() function kya 2 parameters leta hai? (Ans: Plain text password aur Database se aaya Hashed password)
.
Hard: Apne Node.js project mein ek Mongoose middleware likho jo user ke save hone se pehle uska 'fullName' database me uppercase me convert kar de.
9. Important Notes (Revision)
Password ko Database me kabhi Plain text me nahi rakhna. Humesha encrypt karna hai
.
pre('save') middleware hamesha database query chalne se just pehle run hota hai
.
JWT token 3 parts se milke banta hai: Header, Payload, aur Signature (jo Secret se banti hai)
.
isModified('password') lagana ek lifesaver hai, varna updates ke time password bigad jayega
.
Password hashing ya comparison me time lagta hai, isliye humesha async/await use karein
.
10. Learning Gaps
Prerequisites (Pehle kya aana chahiye): JavaScript (ES6+), Node.js basic, Promises/Async-Await, aur MongoDB ki basic queries (find, insert).
Next Steps (Baad me kya seekhna hai): Iske baad aapko Express.js ke Controllers aur Routes sikhne padenge taaki aap API bana sakein jahan user apna email aur password Postman se bhejega aur wahan in methods ka actually use hoga.
11. Project/Application Ideas
Blogging Platform: Ek user model banaye, log signup/login karein (is video wali JWT approach se). Aur phir ek Blog model banaye (Video model ki tarah).
Task Manager API: Sirf authenticated users hi apne tasks dekh sakein. Jo JWT token valid provide karega, usko hi response milega.
12. 80/20 Revision
Ye 20% concept apko 80% marks/understanding dilaenge:
Mongoose Schema + Export: const User = mongoose.model("User", userSchema)
.
Pre-Save Hook Logic: schema.pre("save", async function(next){ if(!this.isModified("password")) return next(); this.password = await bcrypt.hash(this.password, 10); next(); })
.
JWT Generation: jwt.sign(payload, secretKey, {expiresIn})
.
13. Quiz Me
(Answers abhi nahi de raha hoon, aap sochna aur batana!)
Database mein search optimize karne ke liye hum schema mein kaunsi property use karte hain?
bcrypt.hash() method mein hum round/salt kyu pass karte hain?
Agar pre-hook mein hum arrow function likh de toh console mein this ki value kya aayegi?
JWT token ka kaunsa part hai jo ye ensure karta hai ki kisi hacker ne beech mein data change nahi kiya hai?
jwt.sign() method mein 'payload' ka matlab kya hota hai?
Mongoose plugin mongoose-aggregate-paginate-v2 ka main use kya hai?
Cloudinary kis type ki service hai aur hum database mein kya save karte hain?
Access token ko normally hum kis jagah par save karte hain? (Hint: video mein baat hui thi)
Kya hum custom methods jaise isPasswordCorrect ko seedha database par query maarne ke liye use karte hain ya ek specific user document pe?
next() function ko middleware ke end mein call na karne ka result kya hoga?

--------------------------------------------------------------------------------
Code Explanation Mastery (Aapke Instructions Ke Anusar)
Aapne poocha tha ki mind mein kaise aata hai ki kya likhna hai, syntax kya hai, aur actual code kya hai. Aaiye isko Backend Developer ki tarah sochte hain.
1. Mind Setup (Ye Code Kyu Likhna Hai?)
Problem: Frontend se user ne signup form bhara. Usne password diya "karan123". Agar main usko seedha MongoDB me save kar doon, toh kal ko agar kisi ne MongoDB open kiya toh use dikh jayega ki Karan ka password "karan123" hai. Mujhe Mongoose ko bolna hai: "Suno Mongoose, jab bhi tum is data ko save karne ja rahe ho, theek 1 second pehle rukna. Ek kaam hai mera. Uss password ko badal kar ek code bana do, phir save hone dena."
Backend mein aisi "save hone se pehle" wali requirement ke liye Middleware / Hooks use hote hain.
2. Pre-Hook Code (Password Hashing)
Step 1: Syntax Samajhte Hain
schema_ka_naam.pre('kaha_pe_rukna_hai', callback_function_jo_karna_hai)
schema.pre : Matlab kisi action se pehle kuch karo.
'save' : Ye wo event hai jispar rukhna hai.
callback : Asli logic yahin aayega. Mongoose yahan hume ek next variable deta hai taaki hum kaam khatam karke use bol sakein "ab tum aage jao"
.
Step 2: Asli Code Samajhte Hain
userSchema.pre("save", async function (next) {
    
    // 1. Agar password nahi badla, toh kuch mat karo, aage jao
    if(!this.isModified("password")) {
        return next();
    }

    // 2. Agar badla hai, toh usko encrypt (hash) kar do
    this.password = await bcrypt.hash(this.password, 10)
    
    // 3. Kaam ho gaya, Mongoose ko bol do aage badhne ke liye
    next()
})
Line-by-Line Explanation & Dry Run:
userSchema.pre("save", async function(next) : Save event se pehle ye async function chalega. Isme async kyu? Kyunki encryption me time (CPU power) lagta hai, toh code block na ho isliye async use kiya
.
if(!this.isModified("password")) return next(); : Ye mind me tab aaya jab instructor ne socha ki agar user sirf apni Profile Photo update karega, toh bhi ye Hook chal jayega aur password dobara encrypt ho jayega. Toh humne this (current user) se poocha: kya tumhara password modify hua hai? Agar NAHI (!), toh return karke bahar aao aur next() ko pukaar lo
.
this.password = await bcrypt.hash(this.password, 10) : Yahan humne bcrypt library bulayi. Use hash method diya. Usne poocha kisko hash karu? Humne pass kiya this.password (yaani purana "karan123"). Dusra argument 10 hai salt rounds (kitni baar encryption ke cycle ghumane hain, 10 ek standard number hai)
. Jo naya secure password mila, wo humne wapas this.password me daal diya.
next() : Kaam khatam. Mongoose bhaiyya ab tum jaake save kar lo database me.
3. Custom Methods (Is Password Correct)
Mind Setup: Ab database me password hashed roop mein (jaise: $2b$10$xyz...) pada hai. User login karne aaya aur usne firse "karan123" likha. Main unhe directly string se match nahi kar sakta. Mujhe wapas bcrypt ke paas jaana hoga. Toh kyu na main userSchema ke andar hi ek custom function bana doon, taaki controller me bas user.isPasswordCorrect("karan123") likhun aur mera kaam ho jaye?
Step 1: Syntax Samajhte Hain
schema_ka_naam.methods.mere_function_ka_naam = function(arguments) {
    // apna logic likho
}
Step 2: Asli Code Samajhte Hain
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.isPasswordCorrect : Humne apne model mein ek naya skill/method jod diya
.
async function(password) : User jo password login time daalega wo as a parameter aayega. Ye bhi async hai kyuki compare karne me time lagta hai
.
bcrypt.compare(password, this.password) : Bcrypt ek smart algorithm hai. Hum use plain text password (jo function me pass hua) aur database wala password (this.password) dete hain. Ye khud mathematics karke check karega ki dono match hote hain ya nahi. Aur return me True ya False dega
.

--------------------------------------------------------------------------------
Backend System ka Data Flow Kaisa Hota Hai? (Bonus for you!)
As a beginner, backend ka ye flow samajhna sabse zaruri hai:
Client (Browser/Mobile): User apne form mein email aur password dalta hai aur "Submit" dabata hai. Ek Request create hoti hai.
Express.js Server (Entry Point): Ye request hamare backend me aati hai. Node.js Express framework isko receive karta hai.
Router: Express dekhta hai ki URL kya hai (jaise /api/users/login). Wo us route ko pakad ke Controller ke paas bhejta hai.
Controller: Controller ka kaam hai dimaag lagana. Wo dekhta hai "Acha, isko login karna hai". Wo request ki body se Email nikalta hai aur MongoDB se puchta hai ki "kya ye Email DB me hai?"
Mongoose Model: Controller directly DB se baat nahi karta. Wo hamare banaye hue User Model se bolta hai User.findOne({email: "karan@email.com"}). Mongoose wo data le aata hai.
Authentication (Yahan hamara aaj ka code use hota hai):
Jab naya user banta hai (Signup), User.create() hit hota hai. Par just MongoDB me save hone se pehle hamara Pre-Save Hook chal jata hai aur password hash kar deta hai.
Jab login hota hai, Controller user dhund ke laata hai. Phir Controller check karta hai user.isPasswordCorrect(frontend_wala_password).
Agar true aaya, toh Controller user.generateAccessToken() call karta hai jo hamare banaye hue method se ek naya JWT generate karke de deta hai.
Response: Controller wo JWT token User ko bhej deta hai JSON/Cookie format mein ki "Lo bhai, tumhara VIP Pass, aage se yahi laana!"
.
Is tarike se puri gaadi chalti hai backend ki. Aasha karta hoon aapko in concepts ki depth samajh aayi hogi. Agar inme se kisi bhi ek line pe doubt hai, toh mujhse bataiye, main ek alag example se aur tod kar samjhaunga! */