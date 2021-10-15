import { JwtService, CustomErrorHandler } from "../../services.js";
import { RefToken, User } from "../../models";
import { JWT_REF_SECRET } from "../../config";
import Joi from "joi";

const tokenController = {
  async refreshToken(req, res, next) {
    const tokenSchema = Joi.object({
      refToken: Joi.string().required(),
    });

    const { error } = tokenSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { refToken } = req.body;
    let refreshToken;
    let userId;
    try {
      refreshToken = await RefToken.findOne({ refToken });
      if (!refreshToken) {
        return next(CustomErrorHandler.unAuthorized("Invalid ref token"));
      }

      const {_id} = await JwtService.verify(refToken, JWT_REF_SECRET);
      userId = _id;
    
    } catch (err) {
        return next(CustomErrorHandler.unAuthorized("Invalid ref token"));
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(CustomErrorHandler.unAuthorized("No user found"));
    }

    const accessToken = JwtService.sign({ _id: userId });
    refreshToken = JwtService.sign({ _id: userId }, "1y", JWT_REF_SECRET);

    await RefToken.create({ refToken: refreshToken });

    res.json({ accessToken, refToken: refreshToken });
  },
};

export default tokenController;
