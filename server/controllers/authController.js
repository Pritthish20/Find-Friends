import User from "../models/User.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";


const signUp = async (req, res) => {
    const { username, fullName, email, confirmPassword, password } = req.body;
  
    if (!username || !confirmPassword || !password || !fullName || !email) {
        return res.status(403).send("All fields are required")
    }

    if(password !== confirmPassword){
        return res.status(402).send("Password not matched")
    }
  
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).send("User already exists");
  
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ 
        username,
        fullName,
         email,
          password: hashedPassword,
          profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${username}`
         });
  
    try {
      await newUser.save();
      createToken(res, newUser._id);
  
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        profileImage: newUser.profileImage,
      });
    } catch (error) {
      res.status(400);
      throw ne("Invalid user data");
    }
  };
  
  const logIn = async (req, res) => {
    const { username, password } = req.body;
    if (!username  || !password ) {
        return res.status(403).send("Username and password are required")
    }

    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
  
      if (isPasswordValid) {
        createToken(res, existingUser._id);
        return res.status(201).json({
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            fullName: existingUser.fullName,
            profileImage: existingUser.profileImage,
        });
      } else {
        return res.status(401).json({ message: "Invalid Password" });
      }
    } else {
      return res.status(401).json({ message: "User not found" });
    }
  };
  
  const logOut = async (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ message: "Logged Out Successfully" });
};

export {
    signUp,
    logIn,
    logOut
};




