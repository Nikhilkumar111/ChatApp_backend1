import jwt from "jsonwebtoken"
import {ENV} from "./env.js"
const isProduction = process.env.NODE_ENV === "development";

const genrateToken = (userId,res)=>{
     const {JWT_SECRET} = ENV;
     if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not configured");
     }
     
const token = jwt.sign({userId},JWT_SECRET,{
     expiresIn:"7d",
});



res.cookie("jwt", token, {
  httpOnly: true,
  secure: isProduction,        // true on Render (HTTPS)
  sameSite: "none",            // required for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

  return token;
};

export default genrateToken;




