import express from "express";
import {
  registerController,
  loginController,
  userController,
  tokenController,
  productController
} from "../controllers";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/refreshToken", tokenController.refreshToken);
router.post("/logout", auth, loginController.logout);


router.post("/products", productController.store);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.destroy);
router.get("/products", productController.index);
router.get("/product/:id", productController.show);

router.post('/products/cart-items', productController.getProducts);

export default router;
