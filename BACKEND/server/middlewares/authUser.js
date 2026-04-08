import jwt from "jsonwebtoken";


const authUser = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false, message:'Not Authorized'});
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)

        if(tokenDecode&&tokenDecode.id){
            req.userId = tokenDecode.id;
            return next();
        }
        else{
            return res.json({success:false, message:'Not Authorized'});
        }
        

    } catch (error) {
        return res.json({success : false, message : error.message})
    }
}

export default authUser;