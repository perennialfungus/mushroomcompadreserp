import { FileText, PlusCircle, RefreshCw, ShoppingCart, Store, Users } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  convertSalesQuote,
  createSalesQuote,
  listB2BPriceLists,
  listMasterData,
  listResellers,
  listSalesQuotes,
  upsertB2BPriceListLine
} from "./lib/api";
import type { B2BPriceList, MasterDataSnapshot, Reseller, SalesQuote } from "./types";

export function WholesaleScreen() {
  const auth = useAuth();
  const toast = useToast();
  const { formatCurrency, formatDateTime, formatNumber } = useI18n();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [priceLists, setPriceLists] = useState<B2BPriceList[]>([]);
  const [quotes, setQuotes] = useState<SalesQuote[]>([]);
  const [masterData, setMasterData] = useState<MasterDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResellerId, setSelectedResellerId] = useState("reseller-algarve-wellness");
  const [quoteQuantity, setQuoteQuantity] = useState("24");
  const [priceMinQuantity, setPriceMinQuantity] = useState("24");
  const [priceUnitPrice, setPriceUnitPrice] = useState("9.50");
  const selectedVariant = masterData?.productVariants[0] ?? null;
  const selectedReseller = resellers.find((reseller) => reseller.id === selectedResellerId) ?? resellers[0] ?? null;
  const selectedPriceList = useMemo(
    () => priceLists.find((priceList) => priceList.id === selectedReseller?.priceListId) ?? priceLists[0] ?? null,
    [priceLists, selectedReseller?.priceListId]
  );

  async function loadWholesale() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [resellerResponse, priceListResponse, quoteResponse, masterDataResponse] = await Promise.all([
        listResellers(auth.session.accessToken),
        listB2BPriceLists(auth.session.accessToken),
        listSalesQuotes(auth.session.accessToken),
        listMasterData(auth.session.accessToken)
      ]);
      setResellers(resellerResponse.resellers);
      setPriceLists(priceListResponse.priceLists);
      setQuotes(quoteResponse.quotes);
      setMasterData(masterDataResponse);
      setSelectedResellerId(resellerResponse.resellers[0]?.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Wholesale data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWholesale();
  }, [auth.session]);

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedReseller || !selectedVariant) {
      return;
    }
    const quantity = Number(quoteQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    try {
      const response = await createSalesQuote(auth.session.accessToken, {
        resellerId: selectedReseller.id,
        lines: [{ productVariantId: selectedVariant.id, quantity, uom: selectedVariant.sellableUom }]
      });
      setQuotes((current) => [response.quote, ...current]);
      toast.showToast({ title: "Quote created", description: "Draft quote is ready to convert." });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Quote could not be created.");
    }
  }

  async function submitPriceLine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedPriceList || !selectedVariant) {
      return;
    }
    const minQuantity = Number(priceMinQuantity);
    const unitPrice = Number(priceUnitPrice);
    if (!Number.isFinite(minQuantity) || !Number.isFinite(unitPrice) || minQuantity <= 0 || unitPrice <= 0) {
      setError("Price and minimum quantity must be greater than zero.");
      return;
    }
    try {
      const response = await upsertB2BPriceListLine(auth.session.accessToken, selectedPriceList.id, {
        productVariantId: selectedVariant.id,
        minQuantity,
        unitPrice,
        effectiveFrom: new Date().toISOString()
      });
      setPriceLists((current) =>
        current.map((priceList) =>
          priceList.id === selectedPriceList.id
            ? {
                ...priceList,
                lines: [
                  response.line,
                  ...priceList.lines.filter((line) => line.id !== response.line.id)
                ]
              }
            : priceList
        )
      );
      toast.showToast({ title: "Price line saved", description: selectedPriceList.name });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Price line could not be saved.");
    }
  }

  async function convertQuote(quote: SalesQuote) {
    if (!auth.session) {
      return;
    }
    try {
      const result = await convertSalesQuote(auth.session.accessToken, quote.id);
      setQuotes((current) => current.map((candidate) => (candidate.id === quote.id ? result.quote : candidate)));
      toast.showToast({ title: "Wholesale order created", description: result.order.orderNumber });
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Quote conversion failed.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="wholesale-title">
      <div className="screen-heading">
        <p className="eyebrow">Wholesale</p>
        <h2 id="wholesale-title">Reseller quotes and B2B orders</h2>
        <p>Price-list totals are stored for export while stock reservation stays lot-traceable.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Resellers</span>
          <strong>{formatNumber(resellers.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Price lists</span>
          <strong>{formatNumber(priceLists.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Quotes</span>
          <strong>{formatNumber(quotes.length)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "quotes",
            label: "Quotes",
            content: loading ? (
              <EmptyState title="Loading wholesale" description="Fetching reseller pricing and quotes." />
            ) : (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Quote editor</h3>
                  <Button variant="secondary" size="sm" onClick={() => void loadWholesale()}>
                    <RefreshCw aria-hidden="true" size={16} />
                    Refresh
                  </Button>
                </div>
                <form className="form-grid" onSubmit={submitQuote}>
                  {selectedReseller ? <p className="muted-line">{selectedReseller.customer.name}</p> : null}
                  <label className="input-field">
                    <span>Reseller</span>
                    <select value={selectedResellerId} onChange={(event) => setSelectedResellerId(event.target.value)}>
                      {resellers.map((reseller) => (
                        <option value={reseller.id} key={reseller.id}>
                          {reseller.customer.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Input label="Quantity" value={quoteQuantity} onChange={(event) => setQuoteQuantity(event.target.value)} />
                  <Button type="submit">
                    <PlusCircle aria-hidden="true" size={18} />
                    Create quote
                  </Button>
                </form>
                <table className="list-table">
                  <thead>
                    <tr><th>Quote</th><th>Reseller</th><th>Status</th><th>Total</th><th>Lines</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr key={quote.id}>
                        <td>
                          {quote.quoteNumber}
                          <div className="muted-line">{formatDateTime(new Date(quote.quotedAt))}</div>
                        </td>
                        <td>{quote.reseller.customer.name}</td>
                        <td><Badge tone={quote.status === "converted" ? "success" : "info"}>{quote.status}</Badge></td>
                        <td>{formatCurrency(quote.totalAmountExport, quote.currency)} <span className="muted-line">{quote.currency}</span></td>
                        <td>{quote.lines.map((line) => `${line.quantity} ${line.uom} ${line.sku}`).join(", ")}</td>
                        <td>
                          <Button
                            size="sm"
                            variant={quote.status === "converted" ? "secondary" : "primary"}
                            disabled={quote.status === "converted"}
                            onClick={() => void convertQuote(quote)}
                          >
                            <ShoppingCart aria-hidden="true" size={16} />
                            Convert
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {quotes.length === 0 ? <tr><td colSpan={6}>No reseller quotes yet.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "resellers",
            label: "Resellers",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Accounts</h3>
                  <Badge tone="info"><Users aria-hidden="true" size={14} /> {formatNumber(resellers.length)}</Badge>
                </div>
                <table className="list-table">
                  <thead><tr><th>Name</th><th>Status</th><th>Tax ID</th><th>Terms</th><th>Price list</th></tr></thead>
                  <tbody>
                    {resellers.map((reseller) => (
                      <tr key={reseller.id}>
                        <td>
                          {reseller.customer.name}
                          <div className="muted-line">{reseller.customer.email}</div>
                        </td>
                        <td><Badge tone={reseller.status === "active" ? "success" : "warning"}>{reseller.status}</Badge></td>
                        <td>{reseller.taxId ?? "-"}</td>
                        <td>{reseller.paymentTerms ?? "-"}</td>
                        <td>{reseller.priceList?.name ?? "Unassigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "prices",
            label: "Price Lists",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Price list editor</h3>
                  <Badge tone="info"><Store aria-hidden="true" size={14} /> {selectedPriceList?.currency ?? "EUR"}</Badge>
                </div>
                <form className="form-grid" onSubmit={submitPriceLine}>
                  <Input label="Minimum quantity" value={priceMinQuantity} onChange={(event) => setPriceMinQuantity(event.target.value)} />
                  <Input label="Unit price" value={priceUnitPrice} onChange={(event) => setPriceUnitPrice(event.target.value)} />
                  <Button type="submit">
                    <FileText aria-hidden="true" size={18} />
                    Save price
                  </Button>
                </form>
                <table className="list-table">
                  <thead><tr><th>List</th><th>Status</th><th>SKU</th><th>Min qty</th><th>Unit price</th><th>Effective from</th></tr></thead>
                  <tbody>
                    {priceLists.flatMap((priceList) =>
                      priceList.lines.map((line) => (
                        <tr key={line.id}>
                          <td>{priceList.name}</td>
                          <td><Badge tone={priceList.status === "active" ? "success" : "neutral"}>{priceList.status}</Badge></td>
                          <td>{masterData?.productVariants.find((variant) => variant.id === line.productVariantId)?.sku ?? line.productVariantId}</td>
                          <td>{formatNumber(line.minQuantity)}</td>
                          <td>{formatCurrency(line.unitPrice, priceList.currency)}</td>
                          <td>{line.effectiveFrom ? formatDateTime(new Date(line.effectiveFrom)) : "Always"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
      />
    </section>
  );
}
