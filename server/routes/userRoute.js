import express from "express"
import { authenticate } from "../middlewares/authMiddleware.js";
import {
    friendRequest,
    rejectFriendRequest,
    acceptFriendRequest,
    withdrawRequest,
    unfriend,
    allUsers,
    friends,
    requestRecieved,
    requestSended,
    mutualFriends,
    userDetails,
    searchUser,
    updateInterest,
    getAllInterest,
    getRecommendation
} from "../controllers/userController.js"

const router = express.Router();

router.get("/search", authenticate, searchUser);
router.get('/user-details', authenticate,userDetails)
router.get("/all-users", authenticate, allUsers);
router.get("/friends", authenticate, friends);
router.get("/request-sended", authenticate, requestSended);
router.get("/request-recieved", authenticate, requestRecieved);
router.get("/mutual-friends", authenticate, mutualFriends);
router.get("/all-interest", authenticate, getAllInterest);
router.get("/get-recommendation", authenticate, getRecommendation);


router.put("/friend-request-sent", authenticate, friendRequest);
router.put("/accept-friend-request", authenticate, acceptFriendRequest);
router.put("/reject-friend-request", authenticate, rejectFriendRequest )
router.put("/unfriend", authenticate, unfriend);
router.put("/withdraw-friend-request", authenticate, withdrawRequest);
router.put("/update-interest", authenticate, updateInterest);

export default router;