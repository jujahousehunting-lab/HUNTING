import { Bed, Bath, MapPin, Lock, CheckCircle2, Home, Droplets, ShieldCheck, Fingerprint } from 'lucide-react';
import type { Listing } from '../lib/supabase';

const typeLabels: Record<string, string> = {
  bedsitter: 'Bedsitter',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  studio: 'Studio',
  single: 'Single Room',
};

export default function ListingCard({
  listing,
  unlocked,
  onClick,
}: {
  listing: Listing;
  unlocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-cream-300 hover:shadow-xl hover:border-gold-400 transition-all duration-300"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={listing.image_url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-charcoal-900/80 backdrop-blur text-xs font-semibold text-gold-400">
            {typeLabels[listing.property_type]}
          </span>
          {!listing.available && (
            <span className="px-3 py-1 rounded-full bg-red-600/80 backdrop-blur text-xs font-semibold text-white">
              Taken
            </span>
          )}
        </div>
        {unlocked && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-gold-600/90 backdrop-blur text-xs font-semibold text-charcoal-900 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Unlocked
            </span>
          </div>
        )}
        {listing.quantity > 1 && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-charcoal-900/80 backdrop-blur text-xs font-semibold text-white flex items-center gap-1">
              <Home className="w-3 h-3" /> {listing.quantity} available
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-charcoal-800 leading-snug group-hover:text-gold-700 transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-sm text-charcoal-500 mb-3">
          <MapPin className="w-4 h-4 text-gold-500" />
          <span>{listing.location}, Juja</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-charcoal-600 mb-3">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-charcoal-400" /> {listing.bedrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-charcoal-400" /> {listing.bathrooms}
          </span>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.has_cctv && (
            <span className="flex items-center gap-1 text-xs text-charcoal-600 bg-cream-100 px-2 py-1 rounded-md">
              <ShieldCheck className="w-3 h-3 text-gold-600" /> CCTV
            </span>
          )}
          {listing.has_biometrics && (
            <span className="flex items-center gap-1 text-xs text-charcoal-600 bg-cream-100 px-2 py-1 rounded-md">
              <Fingerprint className="w-3 h-3 text-gold-600" /> Biometric
            </span>
          )}
          {listing.water_price > 0 && (
            <span className="flex items-center gap-1 text-xs text-charcoal-600 bg-cream-100 px-2 py-1 rounded-md">
              <Droplets className="w-3 h-3 text-gold-600" /> Water KES {listing.water_price}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-cream-200">
          <div>
            <p className="text-xs text-charcoal-400">Monthly rent</p>
            <p className="font-bold text-charcoal-900">KES {listing.price.toLocaleString()}</p>
          </div>
          {!unlocked ? (
            <div className="flex items-center gap-1 text-xs font-medium text-gold-700 bg-gold-50 border border-gold-200 px-2.5 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              Locked
            </div>
          ) : (
            <div className="text-xs font-medium text-charcoal-900 bg-gold-100 border border-gold-300 px-2.5 py-1.5 rounded-lg">
              {listing.building_name}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
