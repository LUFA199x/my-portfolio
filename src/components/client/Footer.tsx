import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1e1d1b] px-6 md:px-10 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-xl tracking-widest text-[#3a3835]">ARHDAY</span>

        <p className="font-mono-custom text-[10px] text-[#3a3835] tracking-widest uppercase">
          © {year} Adegheosa. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/adegheosa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
          >
            Instagram
          </a>
          <a
            href="mailto:bookarhday@gmail.com"
            className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
