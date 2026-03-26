const currencySymbolByCode: Record<string, string> = {
  USD: "$",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  CNY: "CNY",
  UYU: "$U",
  ARS: "$",
  BRL: "R$",
  CLP: "$",
  COP: "$",
  MXN: "$",
  PEN: "S/",
}

export const getCurrencySymbol = (currency: string | null | undefined) => {
  if (!currency) {
    return ""
  }

  return currencySymbolByCode[currency.toUpperCase()] ?? currency.toUpperCase()
}

const canFormatWithIntl = (currency: string) => {
  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    })

    return true
  } catch {
    return false
  }
}

export const formatAmountWithCurrency = (
  amount: number,
  currency: string | null | undefined,
) => {
  if (currency) {
    const normalizedCurrency = currency.toUpperCase()

    if (canFormatWithIntl(normalizedCurrency)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: normalizedCurrency,
      }).format(amount)
    }
  }

  const symbol = getCurrencySymbol(currency)

  if (!symbol) {
    return `${amount}`
  }

  return `${symbol}${amount}`
}
