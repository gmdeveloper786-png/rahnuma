import React from 'react';

interface RahnumaLogoProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  size?: 'sm' | 'md';
}

export default function RahnumaLogo({
  variant = 'light',
  showSubtitle = false,
  size = 'md',
}: RahnumaLogoProps) {
  const iconPx = size === 'sm' ? 32 : 36;
  const isDark = variant === 'dark';

  return (
    <span className="inline-flex items-center gap-2 sm:gap-2.5 select-none">
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`shrink-0 ${size === 'sm' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-9 sm:w-9'}`}
      >
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill={isDark ? '#065F46' : '#064E3B'}
        />
        <path
          d="M16 35V14H25.5C30 14 33 16.7 33 20.8C33 24.6 30.4 27.1 26.4 27.5L33.5 35"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35.5 11.5L36.7 14.3L39.5 15.5L36.7 16.7L35.5 19.5L34.3 16.7L31.5 15.5L34.3 14.3L35.5 11.5Z"
          fill="#F59E0B"
        />
        <path
          d="M16 35C20 31 24 29 29 28.2"
          stroke="#F59E0B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>

      <span className="flex flex-col leading-tight">
        <span
          className={`font-display text-base font-extrabold tracking-tight sm:text-lg ${
            isDark ? 'text-white' : 'text-[#064E3B]'
          }`}
        >
          RAHNUMA
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${
              isDark ? 'text-emerald-200/80' : 'text-slate-500'
            }`}
          >
            Counselling Portal
          </span>
        )}
      </span>
    </span>
  );
}
