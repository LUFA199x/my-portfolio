// The login page is outside the main admin layout so it
// doesn't trigger the session check in (admin)/admin/layout.tsx.
// It uses the root layout only.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
