import { CustomErrorHandler, JwtService } from "../services.js";

const auth = async (req, res, next) => {
     
  let authHeder = req.headers.authorization;

  if (!authHeder) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeder.split(' ')[1]; 
  
  try {
      const {_id} = await JwtService.verify(token)

      req.user = {};
      req.user._id = _id;
      next();
  } catch (err) {
    return next(CustomErrorHandler.unAuthorized());
  }

};

export default auth;
