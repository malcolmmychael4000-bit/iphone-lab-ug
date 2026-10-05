import React from 'react';

interface LogoProps {
  isDarkMode?: boolean;
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  isDarkMode = true,
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  const wordmarkSizeClass =
    size === 'lg'
      ? 'h-11 w-[116px]'
      : size === 'sm'
      ? 'h-7 w-[74px]'
      : 'h-8 w-[84px] sm:h-10 sm:w-[105px]';

  const countryMarkSizeClass =
    size === 'lg'
      ? 'text-sm'
      : size === 'sm'
      ? 'text-[10px]'
      : 'text-[11px] sm:text-xs';

  return (
    <div className={`inline-flex flex-col justify-center text-left select-none ${className}`} aria-label="iPhone Lab UG">
      <div className="inline-flex items-center gap-1 leading-none">
        <img
          src={isDarkMode ? '/iphone-lab-ug-wordmark-dark.png' : '/iphone-lab-ug-wordmark-light.png'}
          alt="iPhone Lab"
          className={`${wordmarkSizeClass} shrink-0 object-contain`}
        />
        <span
          className={`${countryMarkSizeClass} border-l border-[#1D9BB5]/60 pl-1.5 font-black uppercase tracking-wide text-[#1D9BB5] font-sans leading-none self-center`}
        >
          UG
        </span>
      </div>
      {showTagline && (
        <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-300 uppercase leading-none mt-1 font-sans">
          WE FIX. WE CARE. WE CONNECT.
        </span>
      )}
    </div>
  );
};
