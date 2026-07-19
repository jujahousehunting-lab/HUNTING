import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const DEMO_EMAIL = 'demo.landlord@jujahomes.co';
    const DEMO_PASSWORD = 'demo1234';

    // Check if demo user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      // Create the demo landlord user properly through the auth admin API
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });

      if (createError) throw createError;
      if (!newUser?.user) throw new Error('Failed to create demo user');
      userId = newUser.user.id;
    }

    // Upsert profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        full_name: 'Demo Landlord',
        role: 'landlord',
        phone: '0712345678',
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // Check if listings already exist for this landlord
    const { data: existingListings } = await adminClient
      .from('listings')
      .select('id')
      .eq('landlord_id', userId);

    if (!existingListings || existingListings.length === 0) {
      const listings = [
        {
          landlord_id: userId,
          title: 'Spacious 2BR near JKUAT Main Gate',
          building_name: 'Tamarind Apartments',
          description: 'Modern 2 bedroom apartment just 5 minutes walk to JKUAT main gate. Tiled floors, ample parking, 24/7 security with CCTV, and reliable water supply. Borehole and county water connected.',
          price: 22000,
          location: 'Witeithie',
          property_type: '2br',
          bedrooms: 2,
          bathrooms: 2,
          image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: ['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'],
          available: true,
          unlocked_price: 100,
        },
        {
          landlord_id: userId,
          title: 'Cozy Bedsitter with Balcony',
          building_name: 'Mirema Heights',
          description: 'Well-lit bedsitter with a private balcony, modern tiles, and a fitted kitchenette. Located in a quiet compound with secure parking. Walking distance to Witeithie shopping center and matatu stage.',
          price: 8000,
          location: 'Witeithie',
          property_type: 'bedsitter',
          bedrooms: 0,
          bathrooms: 1,
          image_url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: ['https://images.pexels.com/photos/6585662/pexels-photo-6585662.jpeg?auto=compress&cs=tinysrgb&w=800'],
          available: true,
          unlocked_price: 100,
        },
        {
          landlord_id: userId,
          title: 'Modern Studio with DSTV Ready',
          building_name: 'Juja South Courts',
          description: 'Compact studio apartment perfect for students. Comes with built-in wardrobes, en-suite bathroom, and a DSTV connection point. High-speed fiber internet available. 10 min walk to JKUAT.',
          price: 6500,
          location: 'Gachorogo',
          property_type: 'studio',
          bedrooms: 0,
          bathrooms: 1,
          image_url: 'https://images.pexels.com/photos/3935350/pexels-photo-3935350.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: [],
          available: true,
          unlocked_price: 100,
        },
        {
          landlord_id: userId,
          title: '3BR Family Home with Garden',
          building_name: 'Membley Estate Villa 7',
          description: 'Spacious 3 bedroom maisonette in a gated community. Master en-suite, large kitchen, dining area, and a private garden. Two parking slots, perimeter wall with electric fence, and a shared playground.',
          price: 45000,
          location: 'Membley',
          property_type: '3br',
          bedrooms: 3,
          bathrooms: 3,
          image_url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1080726/pexels-photo-1080726.jpeg?auto=compress&cs=tinysrgb&w=800'],
          available: true,
          unlocked_price: 100,
        },
        {
          landlord_id: userId,
          title: 'Single Room with Shared Amenities',
          building_name: 'Kenyatta Road Hostel B',
          description: 'Affordable single room ideal for students. Shared bathroom and kitchen facilities. Clean, secure compound with a common area. Water and garbage collection included in the rent.',
          price: 4000,
          location: 'Kenyatta Road',
          property_type: 'single',
          bedrooms: 0,
          bathrooms: 1,
          image_url: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: [],
          available: true,
          unlocked_price: 100,
        },
        {
          landlord_id: userId,
          title: '1BR Apartment with Parking',
          building_name: 'Kalimoni Greens',
          description: 'One bedroom apartment in a serene compound off Thika Road. Spacious living room, separate dining, fitted kitchen with gas cooker, and one dedicated parking slot. Good water supply with backup tank.',
          price: 15000,
          location: 'Kalimoni',
          property_type: '1br',
          bedrooms: 1,
          bathrooms: 1,
          image_url: 'https://images.pexels.com/photos/7587465/pexels-photo-7587465.jpeg?auto=compress&cs=tinysrgb&w=800',
          gallery: ['https://images.pexels.com/photos/7587472/pexels-photo-7587472.jpeg?auto=compress&cs=tinysrgb&w=800'],
          available: true,
          unlocked_price: 100,
        },
      ];

      const { error: insertError } = await adminClient.from('listings').insert(listings);
      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo landlord user and listings ready',
        credentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
        userId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
