import { productName } from "./product";
import { Button } from "@mushroom-compadres/ui";

export function App() {
  return (
    <main>
      <h1>{productName}</h1>
      <p>Locale: en</p>
      <Button>Ready</Button>
    </main>
  );
}
