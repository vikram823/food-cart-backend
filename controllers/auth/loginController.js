import Joi from "joi";
import { JwtService, CustomErrorHandler } from "../../services.js";
import { User, RefToken } from "../../models";
import bcrypt from "bcrypt";
import { JWT_REF_SECRET } from "../../config";
import refToken from "../../models/refToken.js";

const loginController = {
  async login(req, res, next) {
    // validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return next(CustomErrorHandler.invalidCredentials());
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return next(CustomErrorHandler.invalidCredentials());
      }

      const _id = user._id;

      const accessToken = JwtService.sign({ _id });
      const refToken = JwtService.sign({ _id }, "1y", JWT_REF_SECRET);

      await RefToken.create({ refToken });

      res.json({ accessToken, refToken });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {

    const tokenSchema = Joi.object({
      refToken: Joi.string().required(),
    });

    const { error } = tokenSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { refToken } = req.body;
  
    try {
      await RefToken.deleteOne({refToken});

      res.json({message: "Logout successfully"});
    } catch (err) {
      return next(new Error("Something went wrong"));
    }
  },
};

export default loginController;
