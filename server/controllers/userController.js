import User from "../models/User.js";


const searchUser = async (req, res) => {
    try {
        const { term } = req.body;

        if (!term) {
            const allUsers = await User.find({
                _id: { $ne: req.user.id }
            }
            ).select('_id username fullName profileImage interest');
            return res.status(400).json({
                success: true,
                message: "Search query is required",
                allUsers
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: new RegExp(term, "i") } },
                { fullName: { $regex: new RegExp(term, "i") } }
            ]
        }).select('_id username fullName profileImage interest');

        return res.status(200).json({
            success: true,
            message: "user fetched successfully",
            allUsers: users,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error, please try again",
        });
    }
};


const userDetails = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: "User Found",
            user,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again',
        });
    }
}

const allUsers = async (req, res) => {
    try {
        console.log("allusers")
        const allUsers = await User.find({ _id: { $ne: req.user.id } });

        console.log("allUser", allUsers);
        return res.status(200).json({
            success: true,
            message: "all Users fetched",
            allUsers
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error",

        });
    }
}

const friendRequest = async (req, res) => {
    try {
        const { recieverId } = req.body;
        // console.log("req user", req.user);
        if(req.user.id==recieverId){
            return res.status(400).json({
                messsage: "You cannot send request to yourself"
            });
        }
        const sender = await User.findById(req.user.id);
        const reciever = await User.findById(recieverId);

        // /checking they are already request is pending or friend
        if (reciever.friendRequestRecieved.includes(sender._id) || sender.friends.includes(recieverId)) {
            return res.status(400).json({
                messsage: "Request already exist or  an friend"
            });
        }

        // updating model
        reciever.friendRequestRecieved.push(sender._id);
        sender.freindRequestSent.push(recieverId);

        await reciever.save();
        await sender.save();

        return res.status(200).json({
            success: true,
            message: "Request sent successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }


}

const requestSended = async (req, res) => {
    try {
        const userID = req.user.id;
        const requestSended = await User.findById(userID).populate('freindRequestSent');

        return res.status(200).json({
            success: true,
            message: "All friends are fetched successfully",
            requestSent: requestSended?.freindRequestSent
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}

const requestRecieved = async (req, res) => {
    try {
        const userID = req.user.id;
        const requestRecieved = await User.findById(userID).populate('friendRequestRecieved');

        return res.status(200).json({
            success: true,
            message: "All friends are fetched successfully",
            requestRecieved: requestRecieved.friendRequestRecieved
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}


const acceptFriendRequest = async (req, res) => {
    const { senderId } = req.body;
    try {
        const reciever = await User.findById(req.user.id);
        const sender = await User.findById(senderId);

        // adding friends to both user's friend list
        reciever.friends.push(senderId);
        sender.friends.push(req.user.id);

        // removing from friend request
        reciever.friendRequestRecieved.pull(senderId);
        sender.freindRequestSent.pull(req.user.id);

        await reciever.save();
        await sender.save();

        return res.status(200).json({
            success: true,
            message: "Friend request accepted"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}

const rejectFriendRequest = async (req, res) => {
    const { senderId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const sender = await User.findById(senderId);

        if (sender.freindRequestSent.includes(req.user.id)) {
            sender.freindRequestSent.pull(req.user.id);
            await sender.save();
        }
        if ((user.friendRequestRecieved.includes(senderId))) {
            user.friendRequestRecieved.pull(senderId);
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Rejected request Successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}


const friends = async (req, res) => {
    try {
        const userID = req.user.id;
        const friendList = await User.findById(userID).populate('friends');

        return res.status(200).json({
            success: true,
            message: "All friends are fetched successfully",
            friends: friendList.friends
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}


const findMutualFriends = (friend1, friend2) => {
    return friend1.filter(friend => friend2.includes(friend.toString()));
};


const mutualFriends = async (req, res) => {
    const userID = req.user.id;
    const { stalkID } = req.body;
    try {
        const user = await User.findById(userID).populate('friends', '_id fullName username profileImage');
        const stalk = await User.findById(stalkID).populate('friends', '_id fullName username profileImage');

        if (!user || !stalk) {
            return res.status(404).json({
                success: false,
                message: "One or both users not found."
            });
        }

        const userFriends = user.friends.map(friend => friend._id.toString());
        const stalkFriends = stalk.friends.map(friend => friend._id.toString());

        // mutual freind IDs
        const mutualFriendsIds = findMutualFriends(userFriends, stalkFriends);

        // mutual friend details
        const mutualFriends = await User.find({ _id: { $in: mutualFriendsIds } }, '_id fullName username profileImage');

        if (mutualFriends) {
            return res.status(200).json({
                success: true,
                message: "Mutual Freinds",
                mutualFriends,
                count: mutualFriends.length
            });
        }
        else {
            return res.status(201).json({
                success: true,
                message: "No Mutual Freinds.",
                mutualFriends: []
            })
        }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}

const getAllInterest = async(req,res)=>{
    const interests = [
        'Music',
        'Movies',
        'Travelling',
        'Photography',
        'Coding',
        'Machine Learning',
        'Reading Books',
        'Sports',
        'Fitness',
        'Gaming',
        'Cooking',
        'Writing',
        'Hiking',
        'Yoga',
        'Painting',
        'Gardening',
      ];
    
      res.status(200).json({
        success:true,
        message:"Interest Fetched successfully",
        interests
      });
}

const withdrawRequest = async (req, res) => {
    const { recieverId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const reciever = await User.findById(recieverId);

        if (user.freindRequestSent.includes(recieverId)) {
            user.freindRequestSent.pull(recieverId);
            await user.save();
        }

        if (reciever.friendRequestRecieved.includes(req.user.id)) {
            reciever.friendRequestRecieved.pull(req.user.id);
            await reciever.save();
        }

        return res.status(200).json({
            success: true,
            message: "Request withdrawn successfully"
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}



const unfriend = async (req, res) => {
    const { opponentId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const opponentUser = await User.findById(opponentId);

        if (user.friends.includes(opponentId)) {
            user.friends.pull(opponentId);
            opponentUser.friends.pull(req.user.id);

            await user.save();
            await opponentUser.save();
        }

        return res.status(200).json({
            success: true,
            message: "removed from friend list."
        })

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal error"
        });
    }
}



const updateInterest = async (req, res) => {
    const userID = req.user.id;
    const { interests } = req.body;
    // console.log("interests", interests)
    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ 
                success:false,
                message: 'User not found' 
            });
        }

        const uniqueInterests = [...new Set([...user.interest, ...interests])];
        user.interest = uniqueInterests;
        await user.save();

        return res.status(200).json({
            success:true,
            message :"Interest updated"
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating interests',
            error
        });
    }
}


const getRecommendation = async(req,res)=>{
    const userID = req.user.id;
    try {
        const userInterest = await User.findById(userID);
        // console.log("recommendation", userInterest)
        if (!userInterest?.interest) {
            return res.status(404).json({ 
                success:false,
                message: 'No interest exist, Add your interest' 
            });
        }

        const recommendation = await User.find({
            interest: { $in: userInterest?.interest },  // Match users with similar interests
            _id: { 
                $nin: userInterest?.friends,    // Exclude users who are already in the user's friends list
                $ne: userInterest?._id          // Exclude the user themselves
            }
        });


        // console.log("recommendation", recommendation);

        return res.status(200).json({
            success:true,
            message :"Interest updated",
            recommendation
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'recommendation failed',
            error
        });
    }
}




export{
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
};