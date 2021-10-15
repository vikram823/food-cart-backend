import { JwtService, CustomErrorHandler } from "../../services.js";
import { Product } from "../../models";
import multer from "multer";
import path from "path";
import Joi from "joi";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const productController = {
  async store(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(CustomErrorHandler.serverError(err.message));
      }

      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
      });
      const filePath = req.file.path;
      const { error } = productSchema.validate(req.body);

      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });

        return next(error);
      }

      const { name, price, size } = req.body;
      let document;

      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (err) {
        return next(err);
      }
      res.status(201).json({ document });
    });
  },
  async update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(CustomErrorHandler.serverError(err.message));
      }

      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
      });

      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      const { error } = productSchema.validate(req.body);

      if (error) {
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      const _id = req.params.id;
      try {
        document = await Product.findOneAndUpdate(
          { _id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );
      } catch (err) {
        return next(err);
      }
      res.status(201).json({ document });
    });
  },
  async destroy(req, res, next) {
    const _id = req.params.id;
    const document = await Product.findOneAndRemove({ _id });
    if (!document) {
      return next(new Error("Nothing to delete"));
    }

    const imagePath = document._doc.image;

    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      return res.json(document);
    });
  },
  async index(req, res, next) {
    let documents;
    // pagination mongoose-pagination
    try {
      documents = await Product.find()
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },
  async show(req, res, next) {
    let document;
    const _id = req.params.id;
    try {
      document = await Product.findOne({ _id }).select("-updatedAt -__v");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(document);
  },
  async getProducts(req, res, next) {
    let documents;
    try {
        documents = await Product.find({
            _id: { $in: req.body.ids },
        }).select('-updatedAt -__v');
    } catch (err) {
        return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
}
};

export default productController;
