const Footer = () => (
  <footer className="footer-surface py-12 mt-16">
    <div className="container mx-auto px-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-10 w-10 object-contain" />
        <span className="font-serif text-lg sm:text-xl">Sona College of Technology</span>
      </div>
      <p className="text-sm opacity-60 text-center">Project Management Portal — NAAC A++ Accredited Autonomous Institution</p>
      <p className="text-xs opacity-40">© {new Date().getFullYear()} Sona College of Technology, Salem. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
