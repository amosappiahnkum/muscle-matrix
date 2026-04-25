import React from 'react';
import { Phone, Mail } from 'lucide-react';

const ContactBar: React.FC = () => (
  <div className="contact-bar py-2.5 px-4">
    <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">

      <div className="contact-bar__item flex items-center gap-2 text-sm">
        <Phone size={14} />
        <span>0245349937</span>
      </div>

      <div className="contact-bar__item flex items-center gap-2 text-sm">
        <Mail size={14} />
        <a
          href="mailto:emmanueleshun558@gmail.com"
          className="transition-colors duration-200"
        >
          emmanueleshun558@gmail.com
        </a>
      </div>

    </div>
  </div>
);

export default ContactBar;