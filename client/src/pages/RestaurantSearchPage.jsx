import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, SlidersHorizontal, Star, Clock, Flame, Leaf } from 'lucide-react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function RestaurantSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(searchParams.get('maxDeliveryTime') || '');
  const [isVegOnly, setIsVegOnly] = useState(searchParams.get('vegetarian') === 'true');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');

  const [restaurants, setRestaurants] = useState([]);
  const [pagination, setPagination] = useState({ totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSearchResults();
    }, 300);
    return () => clearTimeout(handler);
  }, [query, selectedCuisine, minRating, maxDeliveryTime, isVegOnly, priceRange, sortBy]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (selectedCuisine) params.append('cuisine', selectedCuisine);
      if (minRating) params.append('rating', minRating);
      if (maxDeliveryTime) params.append('maxDeliveryTime', maxDeliveryTime);
      if (isVegOnly) params.append('vegetarian', 'true');
      if (priceRange) params.append('priceRange', priceRange);
      if (sortBy) params.append('sort', sortBy);

      setSearchParams(params);

      const res = await API.get(`/restaurants/search?${params.toString()}`);
      if (res.data.success) {
        setRestaurants(res.data.data.restaurants);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Error conducting search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCuisine('');
    setMinRating('');
    setMaxDeliveryTime('');
    setIsVegOnly(false);
    setPriceRange('');
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-warm-dark tracking-tight">
          Explore Restaurants & Food
        </h1>

        {/* Debounced Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-warm-muted" />
          <input
            type="text"
            placeholder="Search for restaurants, cuisines (e.g. 'piza', 'biryani', 'Delhi Zaika')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-warm-card border border-warm-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-warm-amber"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Multi-Parameter Filter Sidebar */}
        <aside className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-warm-border pb-4">
            <div className="flex items-center gap-2 font-bold text-warm-dark text-sm">
              <Filter className="w-4 h-4 text-warm-amber" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-warm-olive hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-warm-dark block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-1 focus:ring-warm-amber"
            >
              <option value="recommended">Recommended & Popular</option>
              <option value="rating">Rating: High to Low</option>
              <option value="deliveryTime">Delivery Time: Fast First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>

          {/* Cuisine Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-warm-dark block">Cuisine</label>
            <div className="flex flex-wrap gap-1.5">
              {['North Indian', 'Biryani', 'South Indian', 'Italian', 'Chinese', 'Punjabi'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(selectedCuisine === c ? '' : c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCuisine === c
                      ? 'bg-warm-amber text-white shadow-sm'
                      : 'bg-warm-bg border border-warm-border text-warm-dark hover:bg-warm-beige'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-warm-dark block">Minimum Rating</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['3.5', '4.0', '4.5', '4.8'].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? '' : r)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    minRating === r
                      ? 'bg-warm-olive text-white border-warm-olive'
                      : 'bg-warm-bg border-warm-border text-warm-dark hover:bg-warm-beige'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current text-warm-amber" />
                  <span>{r}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Delivery Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-warm-dark block">Max Delivery Time</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['20', '30', '45'].map((t) => (
                <button
                  key={t}
                  onClick={() => setMaxDeliveryTime(maxDeliveryTime === t ? '' : t)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    maxDeliveryTime === t
                      ? 'bg-warm-dark text-white border-warm-dark'
                      : 'bg-warm-bg border-warm-border text-warm-dark hover:bg-warm-beige'
                  }`}
                >
                  ≤ {t} mins
                </button>
              ))}
            </div>
          </div>

          {/* Vegetarian Only Toggle */}
          <div className="pt-2 border-t border-warm-border">
            <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-warm-dark">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Leaf className="w-4 h-4 fill-emerald-600 text-emerald-600" /> Veg Only
              </span>
              <input
                type="checkbox"
                checked={isVegOnly}
                onChange={(e) => setIsVegOnly(e.target.checked)}
                className="w-4 h-4 text-warm-amber rounded border-warm-border focus:ring-warm-amber"
              />
            </label>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-warm-muted border-b border-warm-border pb-3">
            <span>
              Showing <strong className="text-warm-dark font-bold">{restaurants.length}</strong> of{' '}
              {pagination.totalCount || restaurants.length} restaurants
            </span>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest._id} restaurant={rest} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-warm-card rounded-2xl border border-warm-border p-8">
              <Search className="w-12 h-12 text-warm-muted mx-auto" />
              <h3 className="text-lg font-bold text-warm-dark">No restaurants match your search criteria</h3>
              <p className="text-xs text-warm-muted max-w-sm mx-auto">
                Try searching for broader keywords, adjusting delivery time, or clearing filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-warm-amber hover:bg-warm-amber-hover text-white text-xs font-bold rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
