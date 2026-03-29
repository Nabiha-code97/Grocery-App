import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
    const { sellerToken } = req.cookies;

    if(!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }
    try {
            const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
            if(tokenDecode.id){
                req.user = { userId: tokenDecode.id };
            }else{
            return res.json({success:'false', message:'Not authorized!'})
            }
            next();
        } catch (error) {
            console.log(error.message);
            res.json({success:'false', message:error.message})
        }

}