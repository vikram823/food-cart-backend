import Joi from "joi";
import { JwtService, CustomErrorHandler } from "../../services.js";
import { User, RefToken } from "../../models";
import bcrypt from "bcrypt";
import { JWT_REF_SECRET } from "../../config";

const registerController = {
  async register(req, res, next) {
    // validation
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.ref("password"),
    });

    const { error } = registerSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const exist = await User.exists({ email: req.body.email });

      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("This email already exists")
        );
      }
    } catch (err) {
      return next(err);
    }

    const { name, email, password, confirmPassword } = req.body;

    // Hash Password:
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    // Prepare model

    console.log("asd");
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
    });

    let accessToken;
    let refToken;

    try {
      const result = user.save();
      const _id = result._id;

      accessToken = JwtService.sign({ _id });
      refToken = JwtService.sign({ _id }, "1y", JWT_REF_SECRET);

      await RefToken.create({ refToken });

      res.json({ accessToken, refToken });
    } catch (err) {
      return next(err);
    }
  },
};

export default registerController;
