import { AppShell } from "@/components/shell/app-shell";
import { DeviceFrame } from "@/components/shell/device-frame";
import { DemoProvider } from "@/lib/demo-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <DeviceFrame>
        <AppShell>{children}</AppShell>
      </DeviceFrame>
    </DemoProvider>
  );
}
