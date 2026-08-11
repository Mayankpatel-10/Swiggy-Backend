import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Flame, Leaf } from 'lucide-react';

export default function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const {
    _id,
    name,
    cuisine = [],
    rating = 4.5,
    numRatings = 100,
    deliveryTime = 30,
    priceCategory = 2,
    isVegetarian = false,
    image,
    address,
  } = restaurant;

  const priceSymbols = '$'.repeat(priceCategory);

  return (
    <Link
      to={`/restaurants/${_id}`}
      className="group bg-warm-card rounded-2xl overflow-hidden border border-warm-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative aspect-[16/9] w-full bg-warm-beige overflow-hidden">
        <img
          src={image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isVegetarian && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-700 text-white rounded-full flex items-center gap-1 shadow-md">
              <Leaf className="w-3 h-3" /> PURE VEG
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-warm-dark/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <Clock className="w-3.5 h-3.5 text-warm-amber" />
          <span>{deliveryTime} mins</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-warm-dark group-hover:text-warm-amber transition-colors line-clamp-1">
              {name}
            </h3>

            {/* Rating Badge */}
            <div className="px-2 py-0.5 rounded-md bg-warm-olive text-white text-xs font-bold flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 fill-current text-warm-amber" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Cuisine List */}
          <p className="text-xs text-warm-muted line-clamp-1 mb-2">
            {cuisine.join(', ')}
          </p>

          <p className="text-[11px] text-warm-muted/80 line-clamp-1 mb-3">
            📍 {address}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs text-warm-dark font-medium">
          <span className="text-warm-olive font-semibold">{priceSymbols} • ₹150 for two</span>
          <span className="text-warm-amber text-[11px] font-semibold group-hover:underline">
            View Menu →
          </span>
        </div>
      </div>
    </Link>
  );
}
