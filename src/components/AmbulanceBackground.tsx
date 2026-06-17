
import '../assets/admin.css';

const AmbulanceBackground = () => {
  return (
    <div className="amb-bg-container">
      <div className="amb-wireframe">
        <svg viewBox="0 0 320 180" width="280" height="150" xmlns="http://www.w3.org/2000/svg">
          {/* Ambulance Body Wireframe */}
          <path 
            fill="none" 
            stroke="var(--admin-blue)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M30 140 L30 60 C30 50, 40 40, 50 40 L160 40 C170 40, 180 45, 185 55 L220 100 L280 100 C290 100, 300 110, 300 120 L300 140 Z"
          />
          {/* Medical Cross */}
          <path 
            fill="none" 
            stroke="var(--admin-green)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            d="M95 70 L95 110 M75 90 L115 90" 
            style={{ filter: 'drop-shadow(0 0 5px var(--admin-green))' }}
          />
          {/* Wheels */}
          <circle cx="80" cy="140" r="20" fill="none" stroke="var(--admin-blue)" strokeWidth="3" />
          <circle cx="240" cy="140" r="20" fill="none" stroke="var(--admin-blue)" strokeWidth="3" />
          <circle cx="80" cy="140" r="10" fill="var(--admin-blue)" opacity="0.5" />
          <circle cx="240" cy="140" r="10" fill="var(--admin-blue)" opacity="0.5" />
          {/* Siren */}
          <path d="M120 40 L130 25 L150 25 L160 40 Z" fill="none" stroke="var(--admin-blue)" strokeWidth="2" />
          <circle cx="140" cy="32" r="8" fill="var(--admin-red)" className="amb-siren" />
          {/* Window */}
          <path fill="none" stroke="var(--admin-blue)" strokeWidth="2" strokeLinejoin="round" d="M165 50 L195 90 L210 90 L175 50 Z" />
        </svg>
      </div>
    </div>
  );
};

export default AmbulanceBackground;
