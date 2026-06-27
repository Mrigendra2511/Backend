import multer from "multer";
// file phle se multer ke pass hoti hai
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
    
})
export const upload=multer({
    storage,
})







