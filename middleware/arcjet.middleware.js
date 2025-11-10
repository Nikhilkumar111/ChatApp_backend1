import aj from "../lib/arcjet.js"
import {isSpoofedBot} from "@arcjet/inspect"

export const arcjetProtection = async(req,res,next)=>{
     try{

  const decision = await aj.protect(req);

if(decision.isDenied()){
     //rate limiting  condition if you try more then you have to show the 
     // response condition 

     if (decision.reason.isRateLimit()) {

          return 
          res.status(429).json({message:"Rate Limit exceed . Please try again later."});
//check the condition for bot waala 
     }else if(decision.reason.isBot()){

          return 
          res.status(403).json({message:"Bot access denied"});
     }else{
          return 
          res.status(403).json({message:"Access denied by security policy "})
     }
}


//check for spoofed bots
if(decision.results.some(isSpoofedBot)){
     return res.status(403).json({
          error:"Spoofed bot detected",
          message:"Malicious bot activity detected."
     })
}next();


     }catch(error){
          console.log("Arcjet Protection Error",error);
          next();
     }
}
