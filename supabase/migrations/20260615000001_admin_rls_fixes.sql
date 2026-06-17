-- Fix RLS admin overrides for admin dashboard

-- Allow admins to view any student's lesson progress
CREATE POLICY "Admins view all progress" ON public.lesson_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view any student's quiz attempts
CREATE POLICY "Admins view all quiz attempts" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
