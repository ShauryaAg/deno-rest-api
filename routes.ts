import { Router } from "https://deno.land/x/oak/mod.ts";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./controllers/products.ts";

const router = new Router();

router.get("/api/v1/products", getProducts)
  .post("/api/v1/products", addProduct)
  .get("/api/v1/products/:id", getProduct)
  .put("/api/v1/products/:id", updateProduct)
  .delete("/api/v1/products/:id", deleteProduct);

export default router;
