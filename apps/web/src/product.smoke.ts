import { productName } from "./product";

if (productName !== "Mushroom Compadres ERP") {
  throw new Error(`Unexpected product name: ${productName}`);
}
