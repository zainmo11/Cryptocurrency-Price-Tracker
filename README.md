# CryptoCurrency Price Tracker 📈

A modern, responsive cryptocurrency tracking application that provides real-time price data and visualization for the top cryptocurrencies in the market.


## Features

- **Real-time Price Updates**: Automatically refreshes crypto data every minute
- **Interactive Price Charts**: View 7-day price history with interactive charts
- **Price Alerts**: Set custom alerts for when cryptocurrencies reach specified price points
- **Favorites System**: Mark cryptocurrencies as favorites for quick access
- **Search Functionality**: Easily find specific cryptocurrencies
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React**: UI library for building the interface
- **React Hooks**: For state management and side effects
- **Chart.js & react-chartjs-2**: For rendering interactive price charts
- **Lucide React**: For beautiful, customizable SVG icons
- **date-fns**: For date formatting
- **Sonner**: For toast notifications
- **CoinGecko API**: For cryptocurrency market data

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/crypto-price-tracker.git
   cd crypto-price-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open http://localhost:3000 to view the application in your browser.

## Usage

### Viewing Cryptocurrency Data

- The main dashboard displays cryptocurrencies sorted by market capitalization
- Click on a cryptocurrency card to expand it and view the price chart
- Use the search box to find specific cryptocurrencies

### Managing Favorites

- Click the star icon on any cryptocurrency card to add it to favorites
- Toggle the "Favorites" button to filter the view to show only your favorites
- Your favorites are saved in your browser's local storage

### Setting Price Alerts

1. Click on a cryptocurrency to expand its card
2. Enter a price value in the input field
3. Select "Above" or "Below" from the dropdown
4. Click "Set Alert" to create a new price alert
5. You'll receive a notification when the price condition is met

### Refreshing Data

- Data automatically refreshes every minute
- Click the "Refresh" button to manually update all cryptocurrency data

## API Usage

This application uses the CoinGecko API to fetch cryptocurrency data. The API is called with the following parameters:

```
https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=true&price_change_percentage=24h
```

## Customization

### Adding More Cryptocurrencies

By default, the application fetches the top 250 cryptocurrencies. You can modify the `per_page` parameter in the API call to fetch more or fewer cryptocurrencies.

### Changing the Update Interval

The application refreshes data every 60 seconds. To change this interval, modify the second parameter of the `setInterval` call in the `useEffect` hook.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [CoinGecko](https://www.coingecko.com/) for providing the cryptocurrency API
- [React](https://reactjs.org/) for the UI library
- [Chart.js](https://www.chartjs.org/) for the charting capabilities
- [Lucide](https://lucide.dev/) for the icon set

---

Created with ❤️ by Zain
