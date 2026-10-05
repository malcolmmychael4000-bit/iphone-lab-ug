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
      ? 'h-14 w-[148px] sm:h-16 sm:w-[168px]'
      : size === 'sm'
      ? 'h-10 w-[106px]'
      : 'h-12 w-[126px] sm:h-14 sm:w-[148px]';

  const countryMarkSizeClass =
    size === 'lg'
      ? 'text-xl sm:text-2xl'
      : size === 'sm'
      ? 'text-base'
      : 'text-lg sm:text-xl';

  return (
    <div className={`inline-flex flex-col justify-center text-left select-none ${className}`} aria-label="iPhone Lab UG">
      <div className="inline-flex items-center gap-1.5 leading-none">
        <picture className={`${wordmarkSizeClass} shrink-0`}>
          <source
            type="image/webp"
            sizes="168px"
            srcSet={
              isDarkMode
                ? '/iphone-lab-ug-wordmark-dark-350.webp 350w, /iphone-lab-ug-wordmark-dark.webp 700w'
                : '/iphone-lab-ug-wordmark-light-350.webp 350w, /iphone-lab-ug-wordmark-light.webp 700w'
            }
          />
          <img
            src={isDarkMode ? '/iphone-lab-ug-wordmark-dark.png' : '/iphone-lab-ug-wordmark-light.png'}
            alt="iPhone Lab"
            width="700"
            height="266"
            className="h-full w-full object-contain"
          />
        </picture>
        <span
          className={`${countryMarkSizeClass} border-l border-[#1D9BB5]/60 pl-2 font-black uppercase tracking-wide text-[#1D9BB5] font-sans leading-none self-center`}
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
