
CREATE TABLE public.exam_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type text NOT NULL UNIQUE CHECK (exam_type IN ('TYT', 'AYT')),
  exam_date timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can read exam dates
CREATE POLICY "Anyone can read exam dates"
  ON public.exam_dates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert exam dates"
  ON public.exam_dates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update exam dates"
  ON public.exam_dates FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete exam dates"
  ON public.exam_dates FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
