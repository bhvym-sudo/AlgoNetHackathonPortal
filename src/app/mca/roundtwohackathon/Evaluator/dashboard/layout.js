export default function EvaluatorDashboardLayout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">AlgoNet Round 2 Hackathon - Evaluator Portal</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 mt-6">
        {children}
      </main>
    </div>
  );
}
