import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function MainLayout({ children, fullWidth = false }) {
  useScrollReveal('reveal');
  useScrollReveal('reveal-left');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }} className="page-enter">
        {children}
      </main>
      <Footer />
    </div>
  );
}
