import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Loader2, Home } from 'lucide-react';
import { supabase, type Listing, type Unlock } from '../lib/supabase';
import ListingCard from '../components/ListingCard';
import ListingDetail from '../components/ListingDetail';

const JUJA_AREAS = ['Witeithie', 'Gachorogo', 'Membley', 'Kenyatta Road', 'Juja Town', 'Kalimoni', 'Thika Road', 'Rwambogo'];
const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedroom' },
  { value: '3br', label: '3 Bedroom' },
  { value: 'studio', label: 'Studio' },
  { value: 'single', label: 'Single Room' },
];

export default function SeekerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [unlocks, setUnlocks] = useState<Unlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: listingData }, { data: unlockData }] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('unlocks').select('*'),
      ]);
      setListings((listingData as Listing[]) || []);
      setUnlocks((unlockData as Unlock[]) || []);
      setLoading(false);
    })();
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocks.map((u) => u.listing_id)), [unlocks]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (areaFilter && l.location !== areaFilter) return false;
      if (typeFilter && l.property_type !== typeFilter) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      return true;
    });
  }, [listings, search, areaFilter, typeFilter, maxPrice]);

  const activeFilterCount = (areaFilter ? 1 : 0) + (typeFilter ? 1 : 0) + (maxPrice ? 1 : 0);

  function clearFilters() {
    setAreaFilter('');
    setTypeFilter('');
    setMaxPrice('');
  }

  function handleUnlock(listingId: string) {
    setUnlocks((prev) => [...prev, { id: 'temp', seeker_id: '', listing_id: listingId, amount_paid: 100, payment_method: 'mpesa', mpesa_code: null, created_at: new Date().toISOString() }]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero search */}
      <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-950 rounded-2xl p-6 lg:p-8 mb-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Find your home in <span className="text-gold-400">Juja</span></h1>
        <p className="text-cream-200 text-sm mb-5">Browse listings, view photos, and unlock building details for KES 100</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by title or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-charcoal-900 outline-none focus:ring-2 focus:ring-gold-400 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-4 py-3 rounded-xl bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold transition-colors flex items-center gap-2 relative"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-charcoal-900 text-gold-400 text-xs font-bold flex items-center justify-center border border-gold-500">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 bg-charcoal-700/50 backdrop-blur rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gold-300 mb-1.5">Area</label>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-charcoal-900 outline-none bg-white"
              >
                <option value="">All areas</option>
                {JUJA_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gold-300 mb-1.5">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-charcoal-900 outline-none bg-white"
              >
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gold-300 mb-1.5">Max Rent (KES)</label>
              <input
                type="number"
                placeholder="No limit"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-charcoal-900 outline-none placeholder:text-charcoal-400 bg-white"
              />
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gold-300 hover:text-gold-200 col-span-full">
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-charcoal-600 text-sm">
          <span className="font-semibold text-charcoal-900">{filtered.length}</span> {filtered.length === 1 ? 'listing' : 'listings'} found
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Home className="w-12 h-12 text-cream-400 mb-3" />
          <h3 className="font-semibold text-charcoal-700">No listings match your search</h3>
          <p className="text-sm text-charcoal-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              unlocked={unlockedIds.has(listing.id)}
              onClick={() => setSelected(listing)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ListingDetail
          listing={selected}
          unlocked={unlockedIds.has(selected.id)}
          onClose={() => setSelected(null)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
