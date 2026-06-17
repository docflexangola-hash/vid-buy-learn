-- Storage RLS policies for blog buckets
-- Buckets already exist; only policies are missing

-- blog-covers
CREATE POLICY "Admins upload blog covers" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blog covers" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone view blog covers" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'blog-covers');

-- blog-content
CREATE POLICY "Admins upload blog content" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-content' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blog content" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-content' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone view blog content" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'blog-content');
