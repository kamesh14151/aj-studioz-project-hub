const Footer = () => (
  <footer className="footer-surface py-12 mt-16 border-t-4 border-secondary">
    <div className="container mx-auto px-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <img src="https://www.sonatech.ac.in/images/logo.png" alt="Sona College" className="h-10 w-10 object-contain" />
        <span className="font-serif text-lg sm:text-xl tracking-wide">Sona College of Technology</span>
      </div>
      <p className="text-sm opacity-90 text-center">Project Management Portal - NAAC A++ Accredited Autonomous Institution</p>
      <p className="text-xs text-secondary font-semibold tracking-wide">Learning is a Celebration</p>
      <p className="text-xs opacity-75">© {new Date().getFullYear()} Sona College of Technology, Salem. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
