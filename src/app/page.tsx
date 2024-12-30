import Portfolio from "../components/Portfolio";
import { runSimulation } from "@/lib/tradingBot";

export default async function Home() {
  await runSimulation();
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Investment Portfolio
        </h1>
        <Portfolio />
      </div>
    </main>
  );
}
