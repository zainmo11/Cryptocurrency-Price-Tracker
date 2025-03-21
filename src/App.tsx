import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { RefreshCw, TrendingUp, AlertCircle, ChevronDown, ChevronUp, BellOff, Search, Star, StarOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CryptoData {
  id: string;
  image: string
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface PriceAlert {
  id: string;
  cryptoId: string;
  price: number;
  type: 'above' | 'below';
}

function App() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [filteredCryptoData, setFilteredCryptoData] = useState<CryptoData[]>([]);
  const [displayedCryptoCount, setDisplayedCryptoCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [newAlertPrice, setNewAlertPrice] = useState<string>('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [preferredList, setPreferredList] = useState<string[]>(() => {
    const saved = localStorage.getItem('preferredCryptos');
    return saved ? JSON.parse(saved) : ['bitcoin', 'ethereum'];
  });
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  // if ("serviceWorker" in navigator) {
  //   window.addEventListener("load", () => {
  //     navigator.serviceWorker
  //         .register("/sw.js")
  //         .then((registration) => console.log("Service Worker registered", registration))
  //         .catch((error) => console.log("Service Worker registration failed", error));
  //   });
  // }

  const fetchCryptoData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=true&price_change_percentage=24h'
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setCryptoData(data);
      setFilteredCryptoData(data);
      setLastUpdated(new Date());

      checkPriceAlerts(data);
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPriceAlerts = useCallback((data: CryptoData[]) => {
    priceAlerts.forEach(alert => {
      const crypto = data.find(c => c.id === alert.cryptoId);
      if (!crypto) return;

      if (alert.type === 'above' && crypto.current_price > alert.price) {
        toast.success(`${crypto.name} is now above $${alert.price}!`);
        setPriceAlerts(prev => prev.filter(a => a.id !== alert.id));
      } else if (alert.type === 'below' && crypto.current_price < alert.price) {
        toast.success(`${crypto.name} is now below $${alert.price}!`);
        setPriceAlerts(prev => prev.filter(a => a.id !== alert.id));
      }
    });
  }, [priceAlerts]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = cryptoData;

    if (showPreferredOnly) {
      filtered = filtered.filter(crypto => preferredList.includes(crypto.id));
    }

    if (searchQuery) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCryptoData(filtered);
  }, [searchQuery, cryptoData, preferredList, showPreferredOnly]);

  useEffect(() => {
    localStorage.setItem('preferredCryptos', JSON.stringify(preferredList));
  }, [preferredList]);

  const togglePreferred = (cryptoId: string) => {
    setPreferredList(prev =>
      prev.includes(cryptoId)
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  const addPriceAlert = (cryptoId: string) => {
    const price = parseFloat(newAlertPrice);
    if (isNaN(price)) {
      toast.error('Please enter a valid price');
      return;
    }

    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      cryptoId,
      price,
      type: newAlertType
    };

    setPriceAlerts(prev => [...prev, newAlert]);
    setNewAlertPrice('');
    toast.success(`Alert set for ${cryptoId} ${newAlertType} $${price}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'h:mm:ss a');
  };

  const getChartData = (crypto: CryptoData) => {
    if (!crypto.sparkline_in_7d?.price) return null;

    const prices = crypto.sparkline_in_7d.price;
    const labels = Array.from({ length: prices.length }, (_, i) =>
      format(new Date(Date.now() - (prices.length - i) * 3600000), 'MMM d, h aa')
    );

    return {
      labels,
      datasets: [
        {
          label: `${crypto.name} Price`,
          data: prices,
          fill: true,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number) => formatPrice(value),
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const displayedCryptos = filteredCryptoData.slice(0, displayedCryptoCount);
  const hasMoreToShow = displayedCryptoCount < filteredCryptoData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-green-400" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Crypto Price Tracker</h1>
              {lastUpdated && (
                <p className="text-xs sm:text-sm text-gray-400">
                  Last updated: {formatDateTime(lastUpdated)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setShowPreferredOnly(!showPreferredOnly)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                  showPreferredOnly 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-sm">Favorites</span>
              </button>
              <button
                onClick={fetchCryptoData}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-1 sm:flex-none"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isLoading ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCryptos.map((crypto) => (
              <div
                  key={crypto.id}
                  className={`bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:transform hover:scale-[1.02] ${
                      selectedCrypto === crypto.id
                          ? 'border-green-500'
                          : 'border-gray-700 hover:border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-2">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreferred(crypto.id);
                        }}
                        className="mt-1"
                        name={"favorite"}
                        title={ (preferredList.includes(crypto.id))? "Remove from favorites" : "Add to favorites"}
                    >
                      {preferredList.includes(crypto.id) ? (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                      ) : (
                          <StarOff className="w-4 h-4 text-gray-400"/>
                      )}
                    </button>
                    <div
                        onClick={() => setSelectedCrypto(crypto.id === selectedCrypto ? null : crypto.id)}
                        className="cursor-pointer w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center group"
                    >
                      <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-3/4 h-3/4 sm:w-full sm:h-full object-contain spins-coin"
                      />
                    </div>


                    <div onClick={() => setSelectedCrypto(crypto.id === selectedCrypto ? null : crypto.id)}>
                      <h2 className="text-lg sm:text-xl font-semibold cursor-pointer ">{crypto.name}</h2>
                      <p className="text-sm text-gray-400 uppercase cursor-pointer">{crypto.symbol}</p>
                    </div>
                  </div>
                  <span
                      className={`px-2 py-1 rounded text-xs sm:text-sm ${
                          crypto.price_change_percentage_24h >= 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                      }`}
                  >
                  {crypto.price_change_percentage_24h >= 0 ? (
                      <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1"/>
                  ) : (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1"/>
                  )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold mb-4">
                  {formatPrice(crypto.current_price)}
                </p>

                {selectedCrypto === crypto.id && crypto.sparkline_in_7d?.price && (
                    <div className="mb-4 h-32 sm:h-40">
                      <Line data={getChartData(crypto)!} options={chartOptions}/>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-4">
                  <div className="text-gray-400">24h High</div>
                  <div className="text-right font-medium">{formatPrice(crypto.high_24h)}</div>
                  <div className="text-gray-400">24h Low</div>
                  <div className="text-right font-medium">{formatPrice(crypto.low_24h)}</div>
                  <div className="text-gray-400">Market Cap</div>
                  <div className="text-right font-medium">{formatNumber(crypto.market_cap)}</div>
                  <div className="text-gray-400">Volume (24h)</div>
                  <div className="text-right font-medium">{formatNumber(crypto.total_volume)}</div>
                </div>
                <div className="flex justify-end mt-3">
                  <a
                      href={`https://www.coingecko.com/en/coins/${crypto.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 text-xs sm:text-sm md:text-base hover:underline"
                      title={`Learn more about the ${crypto.name} cryptocurrency.`}
                  >
                    Learn more
                  </a>
                </div>
                {selectedCrypto === crypto.id && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-2 w-full">
                          <input
                              type="number"
                              value={newAlertPrice}
                              onChange={(e) => setNewAlertPrice(e.target.value)}
                              placeholder="Set price alert..."
                              className="bg-gray-700 rounded px-2 py-2 text-sm flex-1"
                          />
                          <select
                              value={newAlertType}
                              onChange={(e) => setNewAlertType(e.target.value as 'above' | 'below')}
                              className="bg-gray-700 rounded px-2 py-2 text-sm"
                          >
                            <option value="above">Above</option>
                            <option value="below">Below</option>
                          </select>
                        </div>

                        <button
                            onClick={() => addPriceAlert(crypto.id)}
                            className="bg-green-500 hover:bg-green-600 rounded px-3 py-2 text-sm w-full"
                        >
                          Set Alert
                        </button>
                      </div>

                      {priceAlerts.filter(alert => alert.cryptoId === crypto.id).map(alert => (
                          <div key={alert.id}
                               className="flex items-center justify-between text-xs sm:text-sm bg-gray-700/50 rounded px-3 py-2 mb-2">
                      <span>
                        {alert.type === 'above' ? '↑' : '↓'} {formatPrice(alert.price)}
                      </span>
                            <button
                                onClick={() => setPriceAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                className="text-red-400 hover:text-red-300"
                            >
                              <BellOff className="w-4 h-4"/>
                            </button>
                          </div>
                      ))}
                    </div>
                )}


              </div>
          ))}

        </div>

        {filteredCryptoData.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <p className="text-base sm:text-lg">No cryptocurrencies found matching your search.</p>
            </div>
        )}

        {hasMoreToShow || displayedCryptoCount > 2 ? (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              {hasMoreToShow && (
                  <button
                      onClick={() => setDisplayedCryptoCount(prev => prev + 10)}
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300 hover:text-white border border-gray-700 text-sm"
                  >
                  <ChevronDown className="w-4 h-4" />
                Show 10 More
              </button>
            )}

            {displayedCryptoCount > 2 && (
              <button
                onClick={() => setDisplayedCryptoCount(prev => prev - 10)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300 hover:text-white border border-gray-700 text-sm"
              >
                <ChevronUp className="w-4 h-4" />
                Show 10 Less
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
