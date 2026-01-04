import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text?: string;
  time: number;
}

interface PlaceDetails {
  result: {
    name: string;
    rating: number;
    user_ratings_total: number;
    reviews: GoogleReview[];
    url: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier que la clé API Google est configurée
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === '') {
      console.log('⚠️ Google Places API Key not configured');
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Google Places API Key not configured',
          message: 'Please configure GOOGLE_PLACES_API_KEY in Supabase secrets'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Récupérer la config depuis la base
    const { data: settings, error: settingsError } = await supabaseClient
      .from('google_reviews_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      throw new Error('Failed to load reviews settings: ' + settingsError?.message);
    }

    const placeId = settings.place_id;

    if (!placeId || placeId === 'YOUR_GOOGLE_PLACE_ID_HERE') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Google Place ID not configured',
          message: 'Please update place_id in google_reviews_settings table'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('🔍 Fetching reviews for place_id:', placeId);

    // Récupérer les détails du lieu depuis Google Places API
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&language=fr&key=${GOOGLE_PLACES_API_KEY}`;
    
    const googleResponse = await fetch(googleUrl);
    
    if (!googleResponse.ok) {
      throw new Error(`Google API error: ${googleResponse.status} ${googleResponse.statusText}`);
    }

    const placeDetails: PlaceDetails = await googleResponse.json();

    if (!placeDetails.result || !placeDetails.result.reviews) {
      throw new Error('No reviews found in Google API response');
    }

    const googleReviews = placeDetails.result.reviews;
    console.log(`📊 Found ${googleReviews.length} reviews from Google`);

    // Compter les nouveaux avis et mises à jour
    let newReviewsCount = 0;
    let updatedReviewsCount = 0;

    // Insérer ou mettre à jour chaque avis
    for (const review of googleReviews) {
      // Créer un ID unique basé sur author_name + time
      const reviewId = `${review.author_name}_${review.time}`.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const reviewData = {
        google_review_id: reviewId,
        place_id: placeId,
        author_name: review.author_name,
        author_photo_url: review.profile_photo_url || null,
        rating: review.rating,
        text: review.text || null,
        relative_time_description: review.relative_time_description,
        published_at: new Date(review.time * 1000).toISOString(),
        language: review.language || 'fr',
        source: 'google',
        visible: true,
        last_synced_at: new Date().toISOString()
      };

      // Vérifier si l'avis existe déjà
      const { data: existingReview } = await supabaseClient
        .from('google_reviews')
        .select('id')
        .eq('google_review_id', reviewId)
        .single();

      if (existingReview) {
        // Mettre à jour
        const { error: updateError } = await supabaseClient
          .from('google_reviews')
          .update(reviewData)
          .eq('google_review_id', reviewId);

        if (updateError) {
          console.error('Error updating review:', updateError);
        } else {
          updatedReviewsCount++;
        }
      } else {
        // Insérer
        const { error: insertError } = await supabaseClient
          .from('google_reviews')
          .insert(reviewData);

        if (insertError) {
          console.error('Error inserting review:', insertError);
        } else {
          newReviewsCount++;
        }
      }
    }

    // Mettre à jour les settings avec les stats Google
    const { error: updateSettingsError } = await supabaseClient
      .from('google_reviews_settings')
      .update({
        place_name: placeDetails.result.name,
        google_maps_url: placeDetails.result.url,
        average_rating: placeDetails.result.rating,
        total_reviews: placeDetails.result.user_ratings_total,
        last_sync_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    if (updateSettingsError) {
      console.error('Error updating settings:', updateSettingsError);
    }

    console.log('✅ Sync complete:', {
      new: newReviewsCount,
      updated: updatedReviewsCount,
      total: googleReviews.length
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Reviews synced successfully',
        stats: {
          new_reviews: newReviewsCount,
          updated_reviews: updatedReviewsCount,
          total_synced: googleReviews.length,
          average_rating: placeDetails.result.rating,
          total_reviews: placeDetails.result.user_ratings_total
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error syncing reviews:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
