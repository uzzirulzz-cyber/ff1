import { redirect } from 'next/navigation'

export default function RootPage() {
  // Root `/` redirects to /admin.
  // If unauthenticated, middleware will bounce to /login?redirect=/admin.
  redirect('/admin')
}
