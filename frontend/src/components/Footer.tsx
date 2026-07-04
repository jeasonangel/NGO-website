import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-primary/10 bg-white mt-8">
      <div className="container-page py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-0.5">
              <span className="w-2 h-6 bg-ngo-primary rounded-sm" />
              <span className="w-2 h-6 bg-ngo-accent rounded-sm" />
              <span className="w-2 h-6 bg-ink-primary/80 rounded-sm" />
            </div>
            <p className="font-bold text-ink-primary">Espoir Santé</p>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">
            A Cameroonian NGO using open census data to target health, water and
            education programs where they're needed most.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink-primary mb-3">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-ink-secondary hover:text-ngo-primary transition-colors">About Us</Link></li>
            <li><Link to="/programs" className="text-ink-secondary hover:text-ngo-primary transition-colors">Our Programs</Link></li>
            <li><Link to="/data" className="text-ink-secondary hover:text-ngo-primary transition-colors">Census Data</Link></li>
            <li><Link to="/contact" className="text-ink-secondary hover:text-ngo-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink-primary mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-ink-muted shrink-0" /> Yaoundé, Cameroon</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-ink-muted shrink-0" /> +237 6xx xxx xxx</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-ink-muted shrink-0" /> contact@espoirsante.cm</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink-primary mb-3">Data Source</p>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Figures on this site are retrieved live from the Cameroon Census Data
            Portal API using a registered API key.
          </p>
        </div>
      </div>

      <div className="border-t border-ink-primary/10">
        <div className="container-page py-4 text-xs text-ink-muted flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {new Date().getFullYear()} Espoir Santé. All rights reserved.</p>
          <p>Powered by the Cameroon Census Data Portal API</p>
        </div>
      </div>
    </footer>
  );
}
