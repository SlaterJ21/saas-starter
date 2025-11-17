import Image from "next/image";

export default function Home() {
  return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            SaaS Starter Kit
          </h1>
          <p className="text-gray-600 mb-8">
            Multi-tenant SaaS platform with team collaboration
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              🚧 Week 1, Day 1 - Foundation setup in progress
            </p>
          </div>
        </div>
      </main>
  );
}
