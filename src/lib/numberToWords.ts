const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN']
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']

function below1000(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + below1000(n % 100) : '')
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'ZERO NAIRA ONLY'
  const naira = Math.floor(amount)
  const kobo  = Math.round((amount - naira) * 100)

  const parts: string[] = []
  if (naira >= 1_000_000) { parts.push(below1000(Math.floor(naira / 1_000_000)) + ' MILLION'); }
  if (naira >= 1_000)     { parts.push(below1000(Math.floor((naira % 1_000_000) / 1_000)) + ' THOUSAND'); }
  const rem = naira % 1_000
  if (rem > 0) parts.push(below1000(rem))

  let result = parts.filter(Boolean).join(' ') + ' NAIRA'
  if (kobo > 0) result += ` AND ${below1000(kobo)} KOBO`
  return result + ' ONLY'
}
