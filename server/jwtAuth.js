const jwt = require('jsonwebtoken');

const jwtAuthentication =(req,res,next)=>{
    //jwt.verify()
    const token=req.headers.token;
    console.log(req.headers.token);
    if(!token){
        return res.json({success:false,message:"로그인 후 이용"});
    }
    jwt.verify(token,"secret_key",(err, user)=>{
        if(err){
            return res.json({success:false,message:"토큰이 유효하지 않습니다"}); 
        }
        next();
    });
}

module.exports = jwtAuthentication;
