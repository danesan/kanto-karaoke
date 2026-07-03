import Image from "next/image";
import kantoLogo from "../../logo/kanto-logo.svg";
import { cn } from "@/lib/utils";

const logoSizes = {
  sm: "w-32 sm:w-40",
  md: "w-52 sm:w-72",
  lg: "w-64 sm:w-96",
  xlg: "w-72 sm:w-[28rem] lg:w-[34rem]"
} as const;

type AppLogoProps = {
  size?: keyof typeof logoSizes;
  className?: string;
  priority?: boolean;
};

export function AppLogo({
  size = "md",
  className,
  priority = false
}: AppLogoProps) {
  return (
    <Image
      src={kantoLogo}
      alt="Kanto"
      className={cn("h-auto max-w-full", logoSizes[size], className)}
      priority={priority}
    />
  );
}
