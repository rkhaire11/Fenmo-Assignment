import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import { Wallet } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wallet className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Expense Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <ExpenseForm />
          </div>

          {/* Right Column: List & Stats */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-500">Overview of your personal expenses</p>
            </div>
            <ExpenseList />
          </div>

        </div>
      </div>
    </main>
  );
}
