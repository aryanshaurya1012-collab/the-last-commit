import React from 'react';

interface CrtAtmosphereProps {
  enabled: boolean;
  reducedEffects?: boolean;
}

export const CrtAtmosphere: React.FC<CrtAtmosphereProps> = ({ enabled, reducedEffects = false }) => {
  if (!enabled || reducedEffects) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none" aria-hidden="true">
      {/* Scanline pattern */}
      <div className="absolute inset-0 crt-overlay opacity-65" />

      {/* Vignette edge darkening */}
      <div className="absolute inset-0 crt-vignette" />

      {/* Analog film grain */}
      <div className="absolute inset-0 analog-grain" />

      {/* Restrained spectral light drifts */}
      <div className="spectral-drift absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#29F06B]/5 blur-3xl pointer-events-none" />
      <div className="spectral-drift absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#A78BFA]/5 blur-3xl pointer-events-none" />
    </div>
  );
};
