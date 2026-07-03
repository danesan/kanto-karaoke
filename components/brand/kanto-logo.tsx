import { useId, type SVGProps } from "react";

type KantoLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function KantoLogo({ title = "Kanto", ...props }: KantoLogoProps) {
  const gradientId = `kanto-logo-gradient-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 1102 622"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1102" y1="622" y2="0">
          <stop offset="0%" stopColor="var(--kanto-logo-start, #4b2ab4)" />
          <stop offset="48%" stopColor="var(--kanto-logo-mid, #6f3fd0)" />
          <stop offset="100%" stopColor="var(--kanto-logo-end, #c28af8)" />
        </linearGradient>
      </defs>
      <style>
        {`
          .kanto-logo__fill {
            fill: url(#${gradientId});
          }

          .kanto-logo__stroke {
            fill: none;
            stroke: url(#${gradientId});
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .kanto-logo__symbol {
            transform-box: view-box;
            transform-origin: 50% 50%;
            transition: transform 180ms ease;
          }

          @media (max-width: 639px) {
            .kanto-logo__wordmark {
              display: none;
            }

            .kanto-logo__symbol {
              transform: translate(0, 126px) scale(1.55);
            }
          }
        `}
      </style>

      <g className="kanto-logo__symbol">
        <path
          className="kanto-logo__stroke"
          strokeWidth="18"
          d="M437 125c0-60 51-108 114-108s114 48 114 108v34c0 61-51 111-114 111s-114-50-114-111v-34Z"
        />
        <path
          className="kanto-logo__stroke"
          strokeWidth="18"
          d="M446 129c70 22 141 22 210 0"
        />
        <path
          className="kanto-logo__stroke"
          strokeWidth="18"
          d="M475 236l18 129M627 236l-18 129"
        />
        <path className="kanto-logo__stroke" strokeWidth="18" d="M551 285v74" />
        <path
          className="kanto-logo__stroke"
          strokeWidth="16"
          d="M523 315v26M579 315v26"
        />
        <path
          className="kanto-logo__stroke"
          strokeWidth="18"
          d="M344 52c-34 46-34 111 0 157M374 79c-21 31-21 75 0 106M403 98c-13 21-13 48 0 69"
        />
        <path
          className="kanto-logo__stroke"
          strokeWidth="18"
          d="M758 52c34 46 34 111 0 157M728 79c21 31 21 75 0 106M699 98c13 21 13 48 0 69"
        />
      </g>

      <g className="kanto-logo__wordmark kanto-logo__fill">
        <path d="M10 414h50v92l88-92h70l-107 103 112 99h-73l-90-83v83H10V414Z" />
        <path d="M248 419c0-7 8-12 15-8l158 87c10 6 10 20 0 26l-158 88c-7 4-15-1-15-9V419Zm50 74v36l33-18-33-18Z" />
        <path d="M464 414h50l102 121V414h50v202h-50L514 494v122h-50V414Z" />
        <path d="M686 414h181v42h-65v160h-51V456h-65v-42Z" />
        <path
          fillRule="evenodd"
          d="M991 410c62 0 111 46 111 105s-49 105-111 105-111-46-111-105 49-105 111-105Zm0 47c-32 0-57 25-57 58s25 58 57 58 57-25 57-58-25-58-57-58Z"
          clipRule="evenodd"
        />
      </g>
    </svg>
  );
}
