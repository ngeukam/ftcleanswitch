export const signInImage = "../doctor.jpg";
export const drawerWidth: number = 240;
export const settings = [
  { text: "Profile", url: "/profile" },
  { text: "Dashboard", url: "/dashboard" },
  { text: "Logout", url: "/login" }
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#00B894";
    case "in_progress":
      return "#0984E3";
    case "pending":
      return "#FDCB6E";
    default:
      return "grey";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "#E17055";
    case "medium":
      return "#F39C12";
    case "low":
      return "#00B894";
    default:
      return "grey";
  }
};

export function formatUtcToDatetimeLocal(isoString:string) {
  const [datePart, timePart] = isoString.split('T');
  const time = timePart?.slice(0, 5); // Prend "17:31" sans les secondes ni le Z
  return `${datePart}T${time}`; // => "2025-07-25T17:31"
}

export const  convertMinutesToHours = (minutes: number) => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

export const currencyData = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "XAF", name: "Central Africa", symbol: "XAF" },
  { code: "GBP", name: "British Pound Sterling", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" }, 
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
]