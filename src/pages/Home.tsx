import React from 'react';
import Header       from './components/Header';
import ContactBar   from './components/ContactBar';
import HeroSlider   from './components/HeroSlider';
import PortalCards  from './components/PortalCards';
import RulesSection from './components/RulesSection';
import Footer       from './components/Footer';

const Home: React.FC = () => (
  <div className="page">
    <Header />
    <ContactBar />
    <HeroSlider />
    <PortalCards />
    <RulesSection />
    <Footer />
  </div>
);

export default Home;