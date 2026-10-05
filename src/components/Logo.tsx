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
      ? 'h-12 w-40'
      : size === 'sm'
      ? 'h-8 w-28'
      : 'h-10 w-36';

  const badgeSizeClass =
    size === 'lg'
      ? 'text-sm sm:text-base px-2.5 py-1 font-black'
      : size === 'sm'
      ? 'text-xs px-2 py-0.5 font-extrabold'
      : 'text-xs sm:text-sm px-2 py-0.5 font-black';
  return (
    <div className={`inline-flex flex-col justify-center text-left select-none ${className}`} aria-label="iPhone Lab UG">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 leading-none">
        <img
          src={isDarkMode ? '/iphone-lab-ug-wordmark-dark.png' : '/iphone-lab-ug-wordmark-light.png'}
          alt="iPhone Lab"
          className={`${wordmarkSizeClass} shrink-0 object-contain`}
        />
        <span
          className={`${badgeSizeClass} inline-flex items-center justify-center font-black uppercase rounded-md bg-[#1D9BB5] text-white tracking-wider font-sans shadow-sm leading-none self-center`}
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
