import { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, Pencil, Trash2, X, Building2, Eye, CheckCircle2, Bed, Bath, MapPin, Upload, ImageIcon, ShieldCheck, Fingerprint, Home } from 'lucide-react';
import { supabase, type Listing } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const JUJA_AREAS = ['Witeithie', 'Gachorogo', 'Membley', 'Kenyatta Road', 'Juja Town', 'Kalimoni', 'Thika Road', 'Rwambogo'];
const TYPE_OPTIONS = [
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedroom' },
  { value: '3br', label: '3 Bedroom' },
  { value: 'studio', label: 'Studio' },
  { value: 'single', label: 'Single Room' },
];

type Draft = {
  title: string;
  building_name: string;
  description: string;
  price: string;
  location: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  image_url: string;
  gallery: string[];
  available: boolean;
  unlocked_price: string;
  quantity: string;
  water_price: string;
  has_cctv: boolean;
  has_biometrics: boolean;
};

const emptyDraft: Draft = {
  title: '', building_name: '', description: '', price: '', location: 'Witeithie',
  property_type: 'bedsitter', bedrooms: '0', bathrooms: '1', image_url: '', gallery: [],
  available: true, unlocked_price: '100', quantity: '1', water_price: '0',
  has_cctv: false, has_biometrics: false,
};

export default function LandlordDashboard() {
  const { profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    setListings((data as Listing[]) || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setDraft(emptyDraft);
    setError('');
    setShowForm(true);
  }

  function openEdit(listing: Listing) {
    setEditing(listing);
    setDraft({
      title: listing.title,
      building_name: listing.building_name,
      description: listing.description,
      price: String(listing.price),
      location: listing.location,
      property_type: listing.property_type,
      bedrooms: String(listing.bedrooms),
      bathrooms: String(listing.bathrooms),
      image_url: listing.image_url,
      gallery: listing.gallery || [],
      available: listing.available,
      unlocked_price: String(listing.unlocked_price),
      quantity: String(listing.quantity ?? 1),
      water_price: String(listing.water_price ?? 0),
      has_cctv: listing.has_cctv ?? false,
      has_biometrics: listing.has_biometrics ?? false,
    });
    setError('');
    setShowForm(true);
  }

  async function uploadMainPhoto(file: File) {
    setUploadingMain(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-main.${ext}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from('listing-photos').upload(filePath, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploadingMain(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(filePath);
    setDraft((d) => ({ ...d, image_url: urlData.publicUrl }));
    setUploadingMain(false);
  }

  async function uploadGalleryPhotos(files: FileList) {
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('listing-photos').upload(filePath, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(filePath);
      urls.push(urlData.publicUrl);
    }
    setDraft((d) => ({ ...d, gallery: [...d.gallery, ...urls] }));
    setUploadingGallery(false);
  }

  function removeGalleryImage(idx: number) {
    setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setError('');
    if (!draft.title.trim() || !draft.building_name.trim() || !draft.description.trim() || !draft.image_url.trim()) {
      setError('Fill in all required fields including the main photo');
      return;
    }
    setSaving(true);

    const payload = {
      title: draft.title.trim(),
      building_name: draft.building_name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price) || 0,
      location: draft.location,
      property_type: draft.property_type,
      bedrooms: Number(draft.bedrooms) || 0,
      bathrooms: Number(draft.bathrooms) || 1,
      image_url: draft.image_url.trim(),
      gallery: draft.gallery,
      available: draft.available,
      unlocked_price: Number(draft.unlocked_price) || 100,
      quantity: Number(draft.quantity) || 1,
      water_price: Number(draft.water_price) || 0,
      has_cctv: draft.has_cctv,
      has_biometrics: draft.has_biometrics,
    };

    if (editing) {
      const { error: updateError } = await supabase.from('listings').update(payload).eq('id', editing.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from('listings').insert(payload);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
    await fetchListings();
  }

  async function handleDelete(listing: Listing) {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    await supabase.from('listings').delete().eq('id', listing.id);
    await fetchListings();
  }

  async function toggleAvailable(listing: Listing) {
    await supabase.from('listings').update({ available: !listing.available }).eq('id', listing.id);
    await fetchListings();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">My Listings</h1>
          <p className="text-charcoal-500 text-sm">Welcome back, {profile?.full_name}. Manage your rental properties here.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Listing
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-cream-100 rounded-2xl border border-dashed border-cream-400">
          <Building2 className="w-12 h-12 text-cream-400 mb-3" />
          <h3 className="font-semibold text-charcoal-700">No listings yet</h3>
          <p className="text-sm text-charcoal-500 mt-1 mb-4">Create your first listing to start receiving tenants</p>
          <button onClick={openNew} className="bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Add your first listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border border-cream-300 overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow">
              <img src={listing.image_url} alt={listing.title} className="w-full sm:w-40 h-40 sm:h-auto object-cover" />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-charcoal-900">{listing.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${listing.available ? 'bg-gold-100 text-gold-700 border border-gold-200' : 'bg-cream-200 text-charcoal-500'}`}>
                    {listing.available ? 'Available' : 'Taken'}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-gold-500" /> {listing.location}, Juja
                </p>
                <div className="flex gap-3 text-xs text-charcoal-600 mb-2">
                  {listing.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.bedrooms}</span>}
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.bathrooms}</span>
                  <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> {listing.quantity ?? 1} avail</span>
                </div>
                <p className="font-bold text-charcoal-900 mb-3">KES {listing.price.toLocaleString()}<span className="text-xs font-normal text-charcoal-400">/mo</span></p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => openEdit(listing)} className="flex-1 py-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-700 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => toggleAvailable(listing)} className="px-3 py-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-700 transition-colors" title={listing.available ? 'Mark as taken' : 'Mark as available'}>
                    {listing.available ? <Eye className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(listing)} className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
          <div className="relative bg-white w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-cream-200 bg-charcoal-900">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Listing' : 'New Listing'}</h3>
              <button onClick={() => !saving && setShowForm(false)} className="text-cream-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {/* Main photo upload */}
              <Field label="Main Photo" required>
                <div className="space-y-2">
                  {draft.image_url ? (
                    <div className="relative rounded-xl overflow-hidden h-40 bg-cream-100">
                      <img src={draft.image_url} alt="Main" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setDraft({ ...draft, image_url: '' })}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-charcoal-900/70 text-white flex items-center justify-center hover:bg-charcoal-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => mainInputRef.current?.click()}
                      disabled={uploadingMain}
                      className="w-full h-40 rounded-xl border-2 border-dashed border-cream-400 hover:border-gold-500 flex flex-col items-center justify-center gap-2 text-charcoal-400 hover:text-gold-600 transition-colors bg-cream-50"
                    >
                      {uploadingMain ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      <span className="text-sm font-medium">{uploadingMain ? 'Uploading...' : 'Upload main photo from gallery'}</span>
                    </button>
                  )}
                  <input
                    ref={mainInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMainPhoto(f); e.target.value = ''; }}
                  />
                </div>
              </Field>

              {/* Gallery photos */}
              <Field label="Additional Photos" hint="Upload multiple photos from your gallery">
                <div className="space-y-2">
                  {draft.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {draft.gallery.map((url, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden h-24 bg-cream-100">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-charcoal-900/70 text-white flex items-center justify-center hover:bg-charcoal-900"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-cream-400 hover:border-gold-500 flex items-center justify-center gap-2 text-charcoal-400 hover:text-gold-600 transition-colors bg-cream-50"
                  >
                    {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    <span className="text-sm font-medium">{uploadingGallery ? 'Uploading...' : 'Add more photos'}</span>
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { const fs = e.target.files; if (fs && fs.length > 0) uploadGalleryPhotos(fs); e.target.value = ''; }}
                  />
                </div>
              </Field>

              <Field label="Title" required>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Spacious 2BR near JKUAT" className={inputCls} />
              </Field>
              <Field label="Building Name" required hint="This is hidden from seekers until they pay">
                <input value={draft.building_name} onChange={(e) => setDraft({ ...draft, building_name: e.target.value })} placeholder="e.g. Tamarind Apartments" className={inputCls} />
              </Field>
              <Field label="Description" required>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the property, amenities, proximity to JKUAT, etc." rows={3} className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly Rent (KES)" required>
                  <input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="15000" className={inputCls} />
                </Field>
                <Field label="Water Price (KES/mo)">
                  <input type="number" value={draft.water_price} onChange={(e) => setDraft({ ...draft, water_price: e.target.value })} placeholder="0" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Unlock Fee (KES)">
                  <input type="number" value={draft.unlocked_price} onChange={(e) => setDraft({ ...draft, unlocked_price: e.target.value })} placeholder="100" className={inputCls} />
                </Field>
                <Field label="Similar Houses Available">
                  <input type="number" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} min="1" placeholder="1" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Area">
                  <select value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={inputCls}>
                    {JUJA_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Property Type">
                  <select value={draft.property_type} onChange={(e) => setDraft({ ...draft, property_type: e.target.value })} className={inputCls}>
                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bedrooms">
                  <input type="number" value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" value={draft.bathrooms} onChange={(e) => setDraft({ ...draft, bathrooms: e.target.value })} className={inputCls} />
                </Field>
              </div>

              {/* Security features */}
              <Field label="Security Features">
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${draft.has_cctv ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}>
                    <input type="checkbox" checked={draft.has_cctv} onChange={(e) => setDraft({ ...draft, has_cctv: e.target.checked })} className="w-4 h-4 accent-gold-600" />
                    <ShieldCheck className={`w-5 h-5 ${draft.has_cctv ? 'text-gold-600' : 'text-charcoal-400'}`} />
                    <span className="text-sm font-medium text-charcoal-700">CCTV</span>
                  </label>
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${draft.has_biometrics ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}>
                    <input type="checkbox" checked={draft.has_biometrics} onChange={(e) => setDraft({ ...draft, has_biometrics: e.target.checked })} className="w-4 h-4 accent-gold-600" />
                    <Fingerprint className={`w-5 h-5 ${draft.has_biometrics ? 'text-gold-600' : 'text-charcoal-400'}`} />
                    <span className="text-sm font-medium text-charcoal-700">Biometrics</span>
                  </label>
                </div>
              </Field>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} className="w-4 h-4 rounded accent-gold-600" />
                <span className="text-sm text-charcoal-700">Available for rent</span>
              </label>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <div className="p-5 border-t border-cream-200 flex gap-3">
              <button onClick={() => setShowForm(false)} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 font-medium hover:bg-cream-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editing ? 'Save Changes' : 'Create Listing')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-100 outline-none text-charcoal-900 placeholder:text-charcoal-400 text-sm bg-white';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-charcoal-500 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-charcoal-400 mt-1">{hint}</p>}
    </div>
  );
}
