export function PhoenixIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo circular */}
      <circle cx="50" cy="50" r="48" fill="#1a1a1a"/>
      
      {/* Llamas/Fuego */}
      <g id="fire">
        {/* Llamas traseras */}
        <path d="M25 70 Q20 55 30 45 Q28 60 35 70" fill="#ff4500" opacity="0.8"/>
        <path d="M75 70 Q80 55 70 45 Q72 60 65 70" fill="#ff4500" opacity="0.8"/>
        <path d="M35 75 Q30 50 40 40 Q38 60 45 75" fill="#ff6347" opacity="0.9"/>
        <path d="M65 75 Q70 50 60 40 Q62 60 55 75" fill="#ff6347" opacity="0.9"/>
        {/* Llamas frontales */}
        <path d="M40 80 Q35 55 45 45 Q42 65 50 80" fill="#ffa500"/>
        <path d="M60 80 Q65 55 55 45 Q58 65 50 80" fill="#ffa500"/>
        <path d="M45 85 Q42 60 48 50 Q46 70 50 85" fill="#ff8c00"/>
        <path d="M55 85 Q58 60 52 50 Q54 70 50 85" fill="#ff8c00"/>
      </g>
      
      {/* Ave/Phoenix */}
      <g id="bird">
        {/* Cuerpo */}
        <ellipse cx="50" cy="45" rx="15" ry="20" fill="#8B4513"/>
        {/* Cabeza */}
        <circle cx="50" cy="25" r="10" fill="#8B4513"/>
        {/* Pico */}
        <path d="M48 23 L52 23 L50 28 Z" fill="#FFD700"/>
        {/* Ojo */}
        <circle cx="47" cy="24" r="2" fill="#000"/>
        <circle cx="47.5" cy="23.5" r="0.5" fill="#fff"/>
        {/* Ala izquierda */}
        <path d="M35 40 Q20 35 15 45 Q25 50 35 48" fill="#A0522D"/>
        <path d="M35 45 Q25 42 20 48 Q28 52 35 50" fill="#8B4513"/>
        {/* Ala derecha */}
        <path d="M65 40 Q80 35 85 45 Q75 50 65 48" fill="#A0522D"/>
        <path d="M65 45 Q75 42 80 48 Q72 52 65 50" fill="#8B4513"/>
        {/* Cola */}
        <path d="M45 62 Q40 75 35 78" fill="none" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
        <path d="M50 65 Q50 78 48 82" fill="none" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 62 Q60 75 65 78" fill="none" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
      </g>
      
      {/* Resplandor del fuego */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff4500" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ff6347" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}
