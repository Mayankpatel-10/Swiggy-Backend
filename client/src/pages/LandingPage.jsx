import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Flame, ShieldCheck, Zap, Bike, Star, ArrowRight, ChevronRight } from 'lucide-react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

const CUISINES = [
  { name: 'North Indian', icon: '🍲', img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80' },
  { name: 'Biryani', icon: '🍚', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80' },
  { name: 'South Indian', icon: '🥞', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' },
  { name: 'Italian', icon: '🍕', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
  { name: 'Chinese', icon: '🍜', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Punjabi', icon: '🫓', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/restaurants');
      if (res.data.success) {
        setRestaurants(res.data.data);
      }

      if (user) {
        const recRes = await API.get(`/restaurants/recommendations/${user.id || user._id}`);
        if (recRes.data.success) {
          setRecommendations(recRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching landing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/restaurants?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative bg-warm-dark text-white rounded-3xl overflow-hidden shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-dark via-warm-dark/95 to-transparent z-10" />
        
        {/* Hero Background Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 z-0 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />

        <div className="relative z-20 max-w-4xl px-8 sm:px-12 py-16 sm:py-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-amber/20 border border-warm-amber/40 text-warm-amber text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Food Delivery & Security Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Order your favorite meals with <span className="text-warm-amber">speed & trust.</span>
          </h1>

          <p className="text-base sm:text-lg text-warm-beige/80 max-w-xl leading-relaxed">
            Delivering authentic Indian curries, fresh biryanis, artisan sourdough pizzas, and gourmet desserts straight to your doorstep.
          </p>

          {/* Hero Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-warm-muted" />
              <input
                type="text"
                placeholder="Search for 'Butter Chicken', 'Delhi Zaika', or 'Indiranagar'..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white text-warm-dark rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-warm-amber hover:bg-warm-amber-hover text-white font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Find Food</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg border-t border-white/10 text-xs text-warm-beige/70">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warm-amber" />
              <span>Dynamic Surge</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-warm-olive" />
              <span>Fraud Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-warm-amber" />
              <span>Smart Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-warm-dark tracking-tight">Popular Cuisines</h2>
            <p className="text-xs text-warm-muted">Explore handpicked flavors across Central City</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-warm-amber hover:underline flex items-center gap-1"
          >
            <span>See All Cuisines</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CUISINES.map((c) => (
            <Link
              key={c.name}
              to={`/restaurants?cuisine=${encodeURIComponent(c.name)}`}
              className="group bg-warm-card border border-warm-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:shadow-lg hover:border-warm-amber transition-all transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-warm-border group-hover:border-warm-amber transition-colors">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-xs text-warm-dark group-hover:text-warm-amber">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommendations Engine Section */}
      {user && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-warm-beige/40 border border-warm-border rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-warm-amber text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-warm-dark">Recommended for You, {user.name}</h2>
                <p className="text-xs text-warm-muted">
                  Personalized scoring engine based on your order history and favorite cuisines
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.restaurant._id} className="relative">
                  <div className="absolute top-2 right-2 z-10 px-2.5 py-1 text-[10px] font-bold bg-warm-dark text-warm-amber rounded-full border border-warm-amber/30 shadow-md">
                    {rec.recommendationReason}
                  </div>
                  <RestaurantCard restaurant={rec.restaurant} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-warm-dark tracking-tight">Top Rated Restaurants</h2>
            <p className="text-xs text-warm-muted">Highest customer ratings in your neighborhood</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-warm-amber hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <RestaurantCard key={rest._id} restaurant={rest} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
