import  jwt from "jsonwebtoken";
import User from '../models/User.js';

//check
const authenticate = async(req,res,next)=>{
    let token;
    token=req.cookies.jwt;
    // console.log(req.cookies);
    if(token){
        try {
            //const { password, user } = User._doc
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            req.user=await User.findById(decode.userId).select("-password");
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token is invalid");
        }
    }else{
        res.status(401);
        throw new Error("Not authorized, no token found");
    }
};

export {authenticate};