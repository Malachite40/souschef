const sizeClasses = {
  sm: "size-7 text-[11px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: keyof typeof sizeClasses;
}

export function UserAvatar({ name, image, size = "md" }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const s = sizeClasses[size];

  return (
    <div
      className={`flex ${s} shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground`}
    >
      {image ? (
        <img
          src={image}
          alt={name || "User"}
          className={`${s} rounded-full object-cover`}
        />
      ) : (
        initials
      )}
    </div>
  );
}
