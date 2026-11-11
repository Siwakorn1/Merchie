import { Suspense } from "react";
import { FixItScreen } from "@/components/fixit/fixit-screen";

export default function FixItPage() {
  return (
    <Suspense>
      <FixItScreen />
    </Suspense>
  );
}
