import type { SVGProps } from "react";

/**
 * Line icons for the admin panel, drawn in the same thin style as the
 * shop icons (src/components/ui/Icon.tsx). They use `currentColor`,
 * so they take the text colour of their parent.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const AdminIcon = {
  Overview: (p: IconProps) => (
    <Svg {...p}>
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="3" />
      <rect x="9" y="7" width="5" height="7" />
      <rect x="2" y="9" width="5" height="5" />
    </Svg>
  ),
  Orders: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2.5 4.5 8 2l5.5 2.5v7L8 14l-5.5-2.5z" />
      <path d="M2.5 4.5 8 7l5.5-2.5M8 7v7" />
    </Svg>
  ),
  Products: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8.5 2H14v5.5L7.5 14 2 8.5z" />
      <circle cx="11" cy="5" r="1" />
    </Svg>
  ),
  Customers: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <path d="M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12 9.8c1.5.6 2.5 2.2 2.5 4.2" />
    </Svg>
  ),
  Returns: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 3 2 6l3 3" />
      <path d="M2 6h7.5a4 4 0 0 1 0 8H6" />
    </Svg>
  ),
  Users: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 1.5 13.5 3.5v4c0 3.3-2.3 5.8-5.5 7-3.2-1.2-5.5-3.7-5.5-7v-4z" />
      <path d="m5.5 8 1.8 1.8L10.8 6.3" />
    </Svg>
  ),
  Warehouse: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
      <path d="M2 5l6 3.5L14 5M8 8.5v6" />
    </Svg>
  ),
  Store: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2.5 6.5V14h11V6.5" />
      <path d="M1.5 6.5 3 2h10l1.5 4.5z" />
      <path d="M6.5 14v-4h3v4" />
    </Svg>
  ),
  Search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3 3" />
    </Svg>
  ),
  Download: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" />
    </Svg>
  ),
  LogOut: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6.5 2.5h-3v11h3M10 5l3 3-3 3M13 8H6" />
    </Svg>
  ),
  Menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2 4h12M2 8h12M2 12h12" />
    </Svg>
  ),
  ArrowLeft: (p: IconProps) => (
    <Svg {...p}>
      <path d="M13 8H3M7 4 3 8l4 4" />
    </Svg>
  ),
};

export type AdminIconName = keyof typeof AdminIcon;
