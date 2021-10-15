import {CustomErrorHandler } from "../../services.js";
import { User} from "../../models";

const userController = {
  async me(req, res, next) {
    const _id = req.user._id;
    try {
      const user = await User.find({ _id }).select("-password -updatedAt -__v");

      if (!user) {
        return next(CustomErrorHandler.notFound);
      }

      res.json(user);
    } catch (err) {
      return next(err);
    }
  },
};

export default userController;
