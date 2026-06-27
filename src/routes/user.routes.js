import {Router} from"express"
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile,
getWatchHistory, loginUSer, logoutUser,
registerUser, updateAccountDetails, 
updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"
import { refreshAcessToken } from "../controllers/user.controller.js";
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),

    registerUser)

router.route("/login").post(loginUSer)

// securedROutes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-Account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-Image").patch(verifyJWT,upload.single("coverimage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
export default router