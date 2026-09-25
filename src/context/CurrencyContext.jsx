import { createContext, useContext, useState, useEffect } from "react";
import { getCurrency } from "../utils/currencies";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() =>
    localStorage.getItem("spendsmart_currency") || "BDT"
  );

  const currency = getCurrency(currencyCode);

  useEffect(() => {
    localStorage.setItem("spendsmart_currency", currencyCode);
  }, [currencyCode]);

  const format = (amount) => {
    try {
      return Number(amount).toLocaleString(undefined, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      });
    } catch {
      return `${currency.symbol}${Number(amount).toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, setCurrencyCode, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}