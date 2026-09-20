import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CAROUSEL_SLIDES = [
  {
    imageName: 'lpage1',
    fallbackUrl: 'https://images.unsplash.com/photo-1621682372775-533449e550ed?q=80&w=2070&auto=format&fit=crop',
    title: 'High-Risk Slope & Debris Flow Hazard',
    badge: 'Active Landslide Sector',
    location: 'Sikkim & Arunachal Himalayan Corridor',
    detail: 'Continuous slope displacement monitoring and critical shear strain detection across fragile montane corridors.'
  },
  {
    imageName: 'lpage2',
    fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    title: 'Orbital Satellite Radar Surveillance',
    badge: 'SAR Telemetry Sync',
    location: 'North Eastern Regional Coverage Grid',
    detail: 'Interferometric Synthetic Aperture Radar (InSAR) and multispectral optical passes tracking precipitation saturation.'
  },
  {
    imageName: 'lpage3',
    fallbackUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?q=80&w=2070&auto=format&fit=crop',
    title: 'Disaster Management & Incident Command',
    badge: 'Govt of India Initiative',
    location: 'NDMA & Regional Emergency Outposts',
    detail: 'Coordinated early warning dissemination, institutional response protocols, and rapid tactical rescue deployment.'
  }
];

function CarouselSlideImage({ slide }) {
  // Cascades through public extensions: /lpage1.jpg, /lpage1.png, /lpage1.jpeg, /lpage1.webp, /lpage1, then fallback
  const possiblePaths = [
    `/${slide.imageName}.jpg`,
    `/${slide.imageName}.png`,
    `/${slide.imageName}.jpeg`,
    `/${slide.imageName}.webp`,
    `/${slide.imageName}`,
    slide.fallbackUrl
  ];
  const [attemptIndex, setAttemptIndex] = useState(0);

  const handleError = () => {
    if (attemptIndex < possiblePaths.length - 1) {
      setAttemptIndex((prev) => prev + 1);
    }
  };

  return (
    <img 
      src={possiblePaths[attemptIndex]} 
      alt={slide.title}
      onError={handleError}
      className="w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125 brightness-90"
    />
  );
}

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#333333] flex flex-col">
      <header className="flex h-20 items-center justify-between px-8 lg:px-16 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-3">
          <img src="/logo-nobg.png" alt="Rakshak Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-[#d93850] uppercase leading-none">RAKSHAK</h1>
            <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase">NER Landslide Detection</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#about" className="text-sm font-bold uppercase tracking-wider hover:text-[#d93850]">About System</a>
          <a href="#coverage" className="text-sm font-bold uppercase tracking-wider hover:text-[#d93850]">Coverage</a>
          <Link to="/app/risk-map" className="text-sm font-bold uppercase tracking-wider hover:text-[#d93850]">Public Map</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
          <div className="inline-block border-l-4 border-[#d93850] pl-4 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666]">Government of India Initiative</h2>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase leading-[1.1] mb-6 text-[#1a1a1a]">
            Think Ahead.<br />
            <span className="text-[#d93850]">Act Before</span><br />
            The Hazard.
          </h1>
          <p className="max-w-xl text-lg font-medium text-[#666666] mb-10 leading-relaxed">
            Rakshak is an advanced predictive modeling and continuous monitoring system for the North Eastern Region, designed to mitigate risks from landslides, floods, and seismic events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/app/risk-map" className="bg-[#d93850] text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#be2d42] text-center shadow-lg transition-transform hover:-translate-y-1">
              Explore Risk Map
            </Link>
            <Link to="/login" className="border-2 border-[#333333] text-[#333333] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#333333] hover:text-white text-center transition-colors">
              Official Access
            </Link>
          </div>
        </div>
        
        {/* Right Side Carousel */}
        <div className="flex-1 relative overflow-hidden hidden lg:block border-l border-[#e0e0e0] bg-[#111827]">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <CarouselSlideImage slide={slide} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent"></div>
            </div>
          ))}

          {/* Top Telemetry & Operations Indicator Badge */}
          <div className="absolute top-8 right-8 bg-[#1f2937]/90 backdrop-blur-md border border-[#374151] px-4 py-2 flex items-center gap-3 shadow-xl z-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {CAROUSEL_SLIDES[currentSlide].badge}
            </span>
          </div>

          {/* Slide Indicators */}
          <div className="absolute top-8 left-8 flex gap-2 z-10">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all ${
                  i === currentSlide ? 'w-8 bg-[#d93850]' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          
          {/* Information Card Over the Carousel */}
          <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-md p-6 border-l-4 border-[#d93850] shadow-2xl z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#d93850]">
                {CAROUSEL_SLIDES[currentSlide].location}
              </span>
              <span className="text-[10px] font-bold text-[#888888] tracking-wider">
                0{currentSlide + 1} / 0{CAROUSEL_SLIDES.length}
              </span>
            </div>
            <h3 className="text-base font-black uppercase tracking-wider text-[#1a1a1a] mb-1">
              {CAROUSEL_SLIDES[currentSlide].title}
            </h3>
            <p className="text-xs font-bold text-[#555555] leading-relaxed">
              {CAROUSEL_SLIDES[currentSlide].detail}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}