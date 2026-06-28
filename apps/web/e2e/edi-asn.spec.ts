import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@mushroom-compadres.test");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("imports an ASN, approves it, and converts it to a receipt from EDI staging", async ({ page }) => {
  const suffix = String(Date.now()).slice(-6);
  const asnNumber = `ASN-PW-${suffix}`;
  const lotCode = `ALC-PW-${suffix}`;
  const supplierLot = `SUP-PW-${suffix}`;

  await signIn(page);
  await page.goto("/purchasing");

  await expect(page.getByRole("heading", { name: "Supplier quality and receiving" })).toBeVisible();
  await page.getByRole("tab", { name: "EDI / ASN" }).click();
  await expect(page.getByRole("heading", { name: "EDI staging center" })).toBeVisible();

  await page.getByLabel("ASN CSV").fill(
    [
      "asn_number,supplier_id,po_number,purchase_order_line_id,ship_date,expected_at,carrier,tracking_number,packing_slip_number,line_number,external_item_code,supplier_sku,quantity,uom,lot_code,supplier_lot_number,expiry_date",
      `${asnNumber},supplier-bio-farms,SUP-PO-2026-001,purchase-order-line-alcohol-001,2026-06-27T08:00:00.000Z,2026-06-28T12:00:00.000Z,DHL,BOL-${suffix},PS-${suffix},1,ALC-96,ALC-96,10,L,${lotCode},${supplierLot},2027-06-30T00:00:00.000Z`
    ].join("\n")
  );
  await page.getByRole("button", { name: "Validate import" }).click();

  await expect(page.getByText("ASN validated")).toBeVisible();
  await expect(page.getByRole("cell", { name: `${asnNumber} SUP-PO-2026-001` })).toBeVisible();
  await expect(page.getByRole("cell", { name: "validated" })).toBeVisible();

  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("ASN approved")).toBeVisible();
  await expect(page.getByRole("cell", { name: "approved" })).toBeVisible();

  await page.getByRole("button", { name: "Receipt" }).click();
  await expect(page.getByText("Receipt draft created")).toBeVisible();
  await expect(page.getByRole("cell", { name: "converted" })).toBeVisible();

  await page.getByRole("tab", { name: "Receiving" }).click();
  await expect(page.getByText(lotCode)).toBeVisible();
  await expect(page.getByText(supplierLot)).toBeVisible();
});
