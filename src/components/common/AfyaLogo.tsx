import React from 'react';

export interface AfyaLogoProps {
  variant?: 'full' | 'emblem' | 'card-front' | 'card-watermark' | 'receipt' | 'thermal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
  monochrome?: boolean;
  className?: string;
  showSubtitle?: boolean;
  customLogoUrl?: string;
  facilityName?: string;
  location?: string;
}

export const AfyaLogo: React.FC<AfyaLogoProps> = ({
  variant = 'full',
  size = 'md',
  inverted = false,
  monochrome = false,
  className = '',
  showSubtitle = true,
  customLogoUrl,
  facilityName = 'AFYA MEDICARE',
  location = 'Kitende – Mwenda Stage, Uganda'
}) => {
  // If custom logo URL is provided (e.g. uploaded by facility)
  const logoImageSrc = customLogoUrl || '/afya_medicare_logo.jpg';

  // Size mapping for emblems
  const emblemSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];

  // SVG Vector Crest for razor-sharp vector rendering & thermal print compatibility
  const SvgEmblem: React.FC<{ className?: string; mono?: boolean; light?: boolean }> = ({
    className = 'w-10 h-10',
    mono = false,
    light = false
  }) => {
    const shieldColor = mono ? '#000000' : light ? '#ffffff' : '#047857'; // emerald-700
    const crossColor = mono ? '#000000' : light ? '#34d399' : '#059669'; // emerald-500
    const pulseColor = mono ? '#ffffff' : light ? '#ffffff' : '#10b981'; // emerald-500 / teal
    const leafColor = mono ? '#000000' : light ? '#6ee7b7' : '#10b981';

    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Shield Outer Contour */}
        <path
          d="M50 8C65 14 82 17 87 23C90 45 84 72 50 92C16 72 10 45 13 23C18 17 35 14 50 8Z"
          stroke={shieldColor}
          strokeWidth="6"
          strokeLinejoin="round"
          fill={light ? 'rgba(255,255,255,0.08)' : mono ? 'none' : 'rgba(16,185,129,0.06)'}
        />
        {/* Medical Cross */}
        <rect x="42" y="26" width="16" height="42" rx="3" fill={crossColor} />
        <rect x="29" y="39" width="42" height="16" rx="3" fill={crossColor} />

        {/* Healing Leaf on Left side */}
        <path
          d="M32 58C31 46 39 37 46 33C47 43 43 53 36 57C34.5 57.8 33.2 58 32 58Z"
          fill={leafColor}
        />

        {/* Lifeline Pulse / Heartbeat Line crossing the badge */}
        <path
          d="M26 47L40 47L44 38L48 56L53 43L56 49L59 47L74 47"
          stroke={mono ? '#ffffff' : pulseColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  };

  // Watermark variation for PVC card background
  if (variant === 'card-watermark') {
    return (
      <div className={`absolute pointer-events-none select-none flex items-center justify-center ${className}`}>
        <div className="opacity-10 scale-150 transform rotate-[-8deg]">
          <SvgEmblem className="w-56 h-56" light={true} />
        </div>
      </div>
    );
  }

  // PVC Card Front Layout
  if (variant === 'card-front') {
    return (
      <div className={`flex items-center gap-2.5 relative z-10 ${className}`}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 p-0.5 shadow-md border border-white/40 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/20">
          <img
            src={logoImageSrc}
            alt="Afya Logo"
            className="w-full h-full object-contain rounded-lg"
            onError={e => {
              // Graceful fallback to SVG if image file missing
              e.currentTarget.style.display = 'none';
              const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextEl) nextEl.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
            <SvgEmblem className="w-7 h-7" />
          </div>
        </div>
        <div className="leading-tight">
          <h3 className="font-black text-sm sm:text-base tracking-tight text-white drop-shadow-xs">
            {facilityName}
          </h3>
          {showSubtitle && (
            <p className="text-[10px] text-white/85 font-medium tracking-wide">
              {location}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Thermal Receipt Format (Specifically tailored for Xprinter 80mm & 58mm printers)
  if (variant === 'thermal') {
    return (
      <div className={`text-center space-y-1 ${className}`}>
        {/* Crisp monochrome or high-contrast logo badge */}
        <div className="flex justify-center mb-1">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src={logoImageSrc}
              alt="Afya Medicare Logo"
              className="w-11 h-11 object-contain filter grayscale contrast-200"
              onError={e => {
                e.currentTarget.style.display = 'none';
                const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextEl) nextEl.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }}>
              <SvgEmblem className="w-10 h-10" mono={true} />
            </div>
          </div>
        </div>

        <h1 className="text-sm font-black tracking-tight text-black uppercase font-mono leading-tight">
          {facilityName}
        </h1>
        {showSubtitle && (
          <p className="text-[10px] text-black font-mono">
            {location}
          </p>
        )}
      </div>
    );
  }

  // General Receipt Layout (Works on digital screens and standard A4 printing)
  if (variant === 'receipt') {
    return (
      <div className={`text-center border-b border-slate-200 pb-3 space-y-1.5 ${className}`}>
        <div className="flex justify-center mb-1">
          <div className="w-12 h-12 rounded-xl bg-white shadow-xs p-1 border border-slate-200 flex items-center justify-center overflow-hidden">
            <img
              src={logoImageSrc}
              alt="Afya Logo"
              className="w-full h-full object-contain rounded-lg"
              onError={e => {
                e.currentTarget.style.display = 'none';
                const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextEl) nextEl.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
              <SvgEmblem className="w-9 h-9" />
            </div>
          </div>
        </div>
        <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase leading-tight">
          {facilityName}
        </h1>
        <p className="text-xs text-slate-600 font-semibold">
          Healthcare Membership &amp; Care Network
        </p>
        {showSubtitle && (
          <p className="text-[11px] text-slate-500 font-medium">
            {location}
          </p>
        )}
        <p className="text-[10px] text-slate-400 font-mono">
          Tel: +256 701 445 920 • Email: accounts@afyamedicare.ug • Reg: MOH-HSD-2026/891
        </p>
      </div>
    );
  }

  // Emblem Only
  if (variant === 'emblem') {
    return (
      <div className={`relative shrink-0 flex items-center justify-center overflow-hidden rounded-xl ${emblemSizeClasses} ${className}`}>
        <img
          src={logoImageSrc}
          alt="Afya Emblem"
          className="w-full h-full object-contain"
          onError={e => {
            e.currentTarget.style.display = 'none';
            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextEl) nextEl.style.display = 'block';
          }}
        />
        <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
          <SvgEmblem className={emblemSizeClasses} light={inverted} mono={monochrome} />
        </div>
      </div>
    );
  }

  // Full default branding (Emblem + Typography)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`rounded-xl bg-white shadow-xs p-1 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden ${emblemSizeClasses}`}
      >
        <img
          src={logoImageSrc}
          alt="Afya Logo"
          className="w-full h-full object-contain"
          onError={e => {
            e.currentTarget.style.display = 'none';
            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextEl) nextEl.style.display = 'block';
          }}
        />
        <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
          <SvgEmblem className="w-full h-full" light={inverted} mono={monochrome} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${
              size === 'xs'
                ? 'text-xs'
                : size === 'sm'
                ? 'text-sm'
                : size === 'lg'
                ? 'text-lg'
                : size === 'xl'
                ? 'text-xl'
                : 'text-base'
            } ${inverted ? 'text-white' : 'text-slate-900'}`}
          >
            {facilityName}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
            NETWORK
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[11px] font-medium truncate ${
              inverted ? 'text-white/80' : 'text-slate-500'
            }`}
          >
            {location}
          </p>
        )}
      </div>
    </div>
  );
};
