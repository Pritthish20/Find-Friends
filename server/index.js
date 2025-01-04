import express from "express"
import cors from "cors"
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"

const port = process.env.PORT || 4000;

//files
import connectDB from './config/db.js';
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"

// configuration
dotenv.config();
connectDB();
const app = express();

app.get("/", (req, res) => {
    res.send("server is running fine");
  });
  


//middlewere

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.use(cors());



//routes

 app.use("/app/vc/auth", authRoute)
 app.use("/app/vc/user",userRoute)
 

//server
app.listen(port, ()=>{
    console.log(`server is listening at port: ${port}`)
})