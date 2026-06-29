import { SecureKeyVault } from "@/components/sections/SecureKeyVault";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-8">Empire Settings</h1>
      <SecureKeyVault />
    </div>
  );
}
