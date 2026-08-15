import type { ReactNode } from "react";
import { Frame } from "@/src/components/ui";

export function ShowcaseGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 xl:grid-cols-2">{children}</div>;
}

export function ShowcasePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Frame surface="background" shadow="sm" className="p-4">
      <h3 className="type-h3 mb-4">{title}</h3>
      {children}
    </Frame>
  );
}

export function TypeSamplePanel({
  title,
  samples,
}: {
  title: string;
  samples: string[][];
}) {
  return (
    <ShowcasePanel title={title}>
      <div className="grid gap-4">
        {samples.map(([label, text, className]) => (
          <div
            key={label}
            className="border-b-[3px] border-border pb-4 last:border-b-0 last:pb-0"
          >
            <p className="type-caption mb-2 text-muted">{label}</p>
            <p className={className}>{text}</p>
            <p className="type-caption mt-2 text-muted">{className}</p>
          </div>
        ))}
      </div>
    </ShowcasePanel>
  );
}
