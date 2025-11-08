-- =============================================
-- Migration: Create Reviews and Ratings System
-- Description: Tables for worker reviews, ratings, and booking history
-- =============================================

-- 1. Create bookings table (simplified for reviews)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Booking details
  service_type TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_hours DECIMAL(10, 2),
  hourly_rate DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  
  -- Verification
  is_verified_purchase BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create review_responses table (worker can respond to reviews)
CREATE TABLE IF NOT EXISTS public.review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  response_text TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id) -- One response per review
);

-- 4. Create review_votes table (helpful votes)
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  is_helpful BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_employer_id ON public.bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON public.bookings(start_date);

CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON public.reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employer_id ON public.reviews(employer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);

-- 6. Setup Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = worker_id OR auth.uid() = employer_id);

CREATE POLICY "Employers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = worker_id OR auth.uid() = employer_id);

-- Reviews policies
CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Employers can create reviews for completed bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id 
    AND EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND status = 'completed'
      AND employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = employer_id);

-- Review responses policies
CREATE POLICY "Review responses are publicly viewable"
  ON public.review_responses FOR SELECT
  USING (true);

CREATE POLICY "Workers can respond to their reviews"
  ON public.review_responses FOR INSERT
  WITH CHECK (
    auth.uid() = worker_id
    AND EXISTS (
      SELECT 1 FROM public.reviews 
      WHERE id = review_id 
      AND worker_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update their responses"
  ON public.review_responses FOR UPDATE
  USING (auth.uid() = worker_id);

-- Review votes policies
CREATE POLICY "Authenticated users can vote"
  ON public.review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON public.review_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access to bookings"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to reviews"
  ON public.reviews FOR ALL
  USING (auth.role() = 'service_role');

-- 7. Create function to update review stats on worker profile
CREATE OR REPLACE FUNCTION public.update_worker_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update worker_profiles with new review stats
  UPDATE public.worker_profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE worker_id = NEW.worker_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE worker_id = NEW.worker_id
    ),
    updated_at = NOW()
  WHERE id = NEW.worker_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create triggers
CREATE TRIGGER update_review_stats_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worker_review_stats();

CREATE TRIGGER update_review_stats_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worker_review_stats();

CREATE TRIGGER update_review_stats_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worker_review_stats();

-- Update bookings updated_at
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- Update reviews updated_at
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- 9. Create views
CREATE OR REPLACE VIEW public.reviews_with_user AS
SELECT 
  r.*,
  u.full_name as employer_name,
  u.avatar_url as employer_avatar,
  rr.response_text as worker_response,
  rr.created_at as response_created_at
FROM public.reviews r
JOIN public.users u ON r.employer_id = u.id
LEFT JOIN public.review_responses rr ON r.id = rr.review_id
ORDER BY r.created_at DESC;

-- 10. Grant permissions
GRANT SELECT ON public.reviews_with_user TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.review_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.review_votes TO authenticated;

-- 11. Comments
COMMENT ON TABLE public.bookings IS 'Booking records between employers and workers';
COMMENT ON TABLE public.reviews IS 'Reviews and ratings for workers';
COMMENT ON TABLE public.review_responses IS 'Worker responses to reviews';
COMMENT ON TABLE public.review_votes IS 'Helpful votes on reviews';

COMMENT ON COLUMN public.reviews.is_verified_purchase IS 'Whether this review is from a verified booking';
COMMENT ON COLUMN public.reviews.helpful_count IS 'Number of helpful votes';

-- =============================================
-- END MIGRATION
-- =============================================

