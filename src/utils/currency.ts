
export const formatAmountWithCurrency = (
  amount:  number,
  currency: string,
) => {

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency as string,
  });

  return formatter.format(amount)
}
