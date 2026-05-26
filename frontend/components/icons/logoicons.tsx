interface Props {
  widthLogoIcon?: number;
  heightLogoIcon?: number;
}

export const LogoIcon = ({ widthLogoIcon = 30, heightLogoIcon = 30 }: Props) => {
  return (
    <svg
      width={widthLogoIcon}
      height={heightLogoIcon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fill="currentColor"
        fontSize="40"
      >
        🐦‍🔥
      </text>
    </svg>
  );
};
