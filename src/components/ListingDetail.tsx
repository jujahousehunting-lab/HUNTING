import { useState } from 'react';
import { X, Bed, Bath, MapPin, Lock, CheckCircle2, Loader2, Building2, Phone, CreditCard, Wallet, Home, Droplets, ShieldCheck, Fingerprint } from 'lucide-react';
import type { Listing } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const typeLabels: Record<string, string> = {
  bedsitter: 'Bedsitter',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  studio: 'Studio',
  single: 'Single Room',
};

export default function ListingDetail({
  listing,
  unlocked,
  onClose,
  onUnlock,
}: {
  listing: Listing;
  unlocked: boolean;
  onClose: () => void;
  onUnlock: (listingId: string) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [error, setError] = useState('');

  const gallery = [listing.image_url, ...listing.gallery].filter(Boolean);

  async function handlePay() {
    setError('');
    if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
      setError('Enter your M-Pesa phone number');
      return;
    }
    setPaying(true);

    await new Promise((r) => setTimeout(r, 1500));

    const { error: insertError } = await supabase.from('unlocks').insert({
      listing_id: listing.id,
      amount_paid: listing.unlocked_price,
      payment_method: paymentMethod,
      mpesa_code: paymentMethod === 'mpesa' ? `QK${Math.random().toString(36).slice(2, 8).toUpperCase()}` : null,
    });

    setPaying(false);

    if (insertError) {
      if (insertError.code === '23505') {
        onUnlock(listing.id);
        setShowPay(false);
      } else {
        setError(insertError.message);
      }
      return;
    }

    onUnlock(listing.id);
    setShowPay(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-charcoal-900/70 backdrop-blur flex items-center justify-center text-white hover:bg-charcoal-900 transition-colors shadow"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto">
          {/* Image gallery */}
          <div className="relative h-64 sm:h-72 bg-cream-200">
            <img src={gallery[activeImg]} alt={listing.title} className="w-full h-full object-cover" />
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-2 rounded-full transition-all ${i === activeImg ? 'bg-gold-500 w-6' : 'bg-white/60 w-2'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-5 lg:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold mb-2 border border-gold-200">
                  {typeLabels[listing.property_type]}
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-charcoal-900 leading-tight">{listing.title}</h2>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-charcoal-400">Monthly</p>
                <p className="text-xl font-bold text-charcoal-900">KES {listing.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-charcoal-500 text-sm mb-4">
              <MapPin className="w-4 h-4 text-gold-500" />
              <span>{listing.location}, Juja</span>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {listing.bedrooms > 0 && (
                <Stat icon={<Bed className="w-4 h-4" />} label="Bedrooms" value={String(listing.bedrooms)} />
              )}
              <Stat icon={<Bath className="w-4 h-4" />} label="Bathrooms" value={String(listing.bathrooms)} />
              <Stat icon={<Home className="w-4 h-4" />} label="Available" value={String(listing.quantity)} />
              {listing.water_price > 0 && (
                <Stat icon={<Droplets className="w-4 h-4" />} label="Water" value={`KES ${listing.water_price}`} />
              )}
            </div>

            {/* Security features */}
            {(listing.has_cctv || listing.has_biometrics) && (
              <div className="flex gap-2 mb-5">
                {listing.has_cctv && (
                  <span className="flex items-center gap-1.5 text-sm text-charcoal-700 bg-cream-100 border border-cream-300 px-3 py-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-gold-600" /> CCTV Surveillance
                  </span>
                )}
                {listing.has_biometrics && (
                  <span className="flex items-center gap-1.5 text-sm text-charcoal-700 bg-cream-100 border border-cream-300 px-3 py-2 rounded-lg">
                    <Fingerprint className="w-4 h-4 text-gold-600" /> Biometric Gate Access
                  </span>
                )}
              </div>
            )}

            <p className="text-charcoal-600 text-sm leading-relaxed mb-5">{listing.description}</p>

            {/* Building name — gated */}
            <div className={`rounded-xl p-4 mb-5 ${unlocked ? 'bg-gold-50 border border-gold-300' : 'bg-cream-100 border border-cream-300'}`}>
              {unlocked ? (
                <>
                  <div className="flex items-center gap-2 text-gold-700 mb-1">
                    <Building2 className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Building Name</span>
                  </div>
                  <p className="text-lg font-bold text-charcoal-900">{listing.building_name}</p>
                  <p className="text-xs text-gold-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> You have unlocked this listing
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-charcoal-500 mb-1">
                    <Lock className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Building Name</span>
                  </div>
                  <p className="text-lg font-bold text-charcoal-300 tracking-widest">••••••••</p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Pay <span className="font-semibold text-charcoal-800">KES {listing.unlocked_price}</span> to reveal the building name and contact the landlord
                  </p>
                </>
              )}
            </div>

            {!unlocked && (
              <button
                onClick={() => setShowPay(true)}
                className="w-full bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Lock className="w-5 h-5" />
                Unlock for KES {listing.unlocked_price}
              </button>
            )}

            {unlocked && (
              <div className="bg-cream-100 rounded-xl p-4 border border-cream-300">
                <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide mb-2">Landlord Contact</p>
                <p className="text-sm text-charcoal-700">Contact the landlord directly to arrange a visit. The building is <span className="font-semibold">{listing.building_name}</span>, located in {listing.location}, Juja.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-900/75 backdrop-blur-sm" onClick={() => !paying && setShowPay(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <button
              onClick={() => !paying && setShowPay(false)}
              className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-charcoal-900 mb-1">Unlock Listing</h3>
            <p className="text-sm text-charcoal-500 mb-5">Pay KES {listing.unlocked_price} to reveal the building name and landlord contact</p>

            <div className="space-y-3 mb-5">
              <button
                onClick={() => setPaymentMethod('mpesa')}
                disabled={paying}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${paymentMethod === 'mpesa' ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}
              >
                <Wallet className={`w-6 h-6 ${paymentMethod === 'mpesa' ? 'text-gold-600' : 'text-charcoal-400'}`} />
                <div>
                  <p className="font-semibold text-charcoal-900 text-sm">M-Pesa</p>
                  <p className="text-xs text-charcoal-500">Pay via M-Pesa STK push</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                disabled={paying}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${paymentMethod === 'card' ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-gold-600' : 'text-charcoal-400'}`} />
                <div>
                  <p className="font-semibold text-charcoal-900 text-sm">Card</p>
                  <p className="text-xs text-charcoal-500">Visa / Mastercard</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-charcoal-500 mb-1.5">M-Pesa Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="tel"
                    placeholder="0712345678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    disabled={paying}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-100 outline-none text-charcoal-900"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 mb-4">
                <input placeholder="Card number" disabled={paying} className="w-full px-3 py-2.5 rounded-lg border border-cream-300 focus:border-gold-500 outline-none text-charcoal-900" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM/YY" disabled={paying} className="px-3 py-2.5 rounded-lg border border-cream-300 focus:border-gold-500 outline-none text-charcoal-900" />
                  <input placeholder="CVC" disabled={paying} className="px-3 py-2.5 rounded-lg border border-cream-300 focus:border-gold-500 outline-none text-charcoal-900" />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing payment...
                </>
              ) : (
                `Pay KES ${listing.unlocked_price}`
              )}
            </button>
            <p className="text-xs text-charcoal-400 text-center mt-3">This is a demo payment — no real money is charged</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-cream-100 rounded-lg p-3 border border-cream-200">
      <div className="flex items-center gap-1.5 text-charcoal-400 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className="font-bold text-charcoal-900 text-sm">{value}</p>
    </div>
  );
}
