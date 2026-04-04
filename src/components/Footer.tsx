const Footer = () => (
  <footer className="footer-surface py-12 mt-16">
    <div className="container mx-auto px-6 flex flex-col items-center gap-4">
      <span className="brand-wordmark text-2xl">aj studioz</span>
      <p className="text-sm opacity-60">College Project Management Portal — Built with precision.</p>
      <p className="text-xs opacity-40">© {new Date().getFullYear()} AJ Studioz. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
