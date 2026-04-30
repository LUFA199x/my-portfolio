import Link from 'next/link'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--black)] pt-0 pb-8 px-6 md:px-10 overflow-hidden">
      {/* Contact columns */}
      <div className="max-w-screen-xl mx-auto">
        <div className="border-t border-white/5 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20">
            {/* Location */}
            <div>
              <p className="font-ui text-white/30 text-xs uppercase mb-3" style={{ letterSpacing: '0.16em' }}>[Location]</p>
              <p className="font-body text-white/70 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                Lagos
                <br />
                5 Kayode Taiwo St, Ikosi Ketu,
              </p>
            </div>

            {/* Pages */}
            <div>
              <p className="font-ui text-white/30 text-xs uppercase mb-3" style={{ letterSpacing: '0.16em' }}>[Pages]</p>
              <nav className="flex flex-col gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-[var(--orange)] transition-colors duration-200"
                    style={{
                      fontFamily: 'var(--font-josefin)',
                      fontSize: '12px',
                      fontWeight: 400,
                      letterSpacing: '0.13em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Social */}
            <div>
              <p className="font-ui text-white/30 text-xs uppercase mb-3" style={{ letterSpacing: '0.16em' }}>[Connect]</p>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:bookarhday@gmail.com"
                  className="font-body text-white/60 text-sm hover:text-white transition-colors duration-200 group"
                  style={{ fontWeight: 400 }}
                >
                  <span className="font-body text-white/30 text-xs block mb-0.5" style={{ fontStyle: 'italic', fontWeight: 300 }}>[My Email]</span>
                  bookarhday@gmail.com
                </a>
                <a
                  href="https://instagram.com/_arhday_photography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-white/60 text-sm hover:text-white transition-colors duration-200"
                  style={{ fontWeight: 400 }}
                >
                  <span className="font-body text-white/30 text-xs block mb-0.5" style={{ fontStyle: 'italic', fontWeight: 300 }}>[My Instagram]</span>
                  @_arhday_photography
                </a>
                <a
                  href="https://x.com/_arhday_photography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-white/60 text-sm hover:text-white transition-colors duration-200"
                  style={{ fontWeight: 400 }}
                >
                  <span className="font-body text-white/30 text-xs block mb-0.5" style={{ fontStyle: 'italic', fontWeight: 300 }}>[My X]</span>
                  @_arhday_photography
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Big name */}
        <div className="relative -mx-6 md:-mx-10 overflow-x-hidden">
          <p
            className="footer-big-text select-none px-4 md:px-8"
            aria-hidden="true"
          >
            Adegheosa
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pt-6 border-t border-white/5 mt-4">
          <p className="font-body text-white/20 text-xs" style={{ fontWeight: 300 }}>
            [Created by ADEGHEOSA] © {year}
          </p>
          <p className="font-body text-white/20 text-xs" style={{ fontWeight: 300 }}>
            Built in pixels, shaped in Adegheosa &nbsp;·&nbsp; [Powered by Next.js]
          </p>
        </div>
      </div>
    </footer>
  )
}
