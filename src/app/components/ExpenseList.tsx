'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { Filter, SortAsc, Coffee, Car, Zap, ShoppingBag, Film, Activity, HelpCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';

type Expense = {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
};

const CategoryIcon = ({ category }: { category: string }) => {
    const iconProps = { size: 18, className: "text-white" };
    let bgClass = "bg-gray-500";
    let Icon = HelpCircle;

    switch (category) {
        case 'Food':
            bgClass = "bg-orange-500";
            Icon = Coffee;
            break;
        case 'Transport':
            bgClass = "bg-blue-500";
            Icon = Car;
            break;
        case 'Utilities':
            bgClass = "bg-yellow-500";
            Icon = Zap;
            break;
        case 'Shopping':
            bgClass = "bg-pink-500";
            Icon = ShoppingBag;
            break;
        case 'Entertainment':
            bgClass = "bg-purple-500";
            Icon = Film;
            break;
        case 'Health':
            bgClass = "bg-green-500";
            Icon = Activity;
            break;
        default:
            bgClass = "bg-gray-500";
            Icon = HelpCircle;
    }

    return (
        <div className={cn("p-2 rounded-full shadow-sm", bgClass)}>
            <Icon {...iconProps} />
        </div>
    );
};

export default function ExpenseList() {
    const [filterCategory, setFilterCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const queryClient = useQueryClient();

    const { data: expenses, isLoading, isError, error } = useQuery<Expense[]>({
        queryKey: ['expenses', filterCategory, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (sortOrder) params.append('sort', sortOrder);

            const res = await fetch(`/api/expenses?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch expenses');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/expenses?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete expense');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            deleteMutation.mutate(id);
        }
    };

    const totalAmount = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Filters & Total Header */}
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="pl-9 pr-8 py-2 w-full rounded-lg border-gray-200 bg-gray-50/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            <option value="Food">Food & Dining</option>
                            <option value="Transport">Transportation</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Health">Health</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="relative flex-1 min-w-[140px]">
                        <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="pl-9 pr-8 py-2 w-full rounded-lg border-gray-200 bg-gray-50/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                <div className="bg-indigo-50 px-5 py-2 rounded-lg border border-indigo-100 flex items-center gap-3">
                    <span className="text-sm font-medium text-indigo-700 uppercase tracking-wide">Total</span>
                    <span className="text-2xl font-bold text-indigo-900">{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            {/* Content State */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                ) : isError ? (
                    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl p-8 text-center rounded-xl border-red-100 bg-red-50/50">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
                        <h3 className="text-lg font-medium text-red-900">Failed to load expenses</h3>
                        <p className="text-red-600 mt-1">{error.message}</p>
                    </div>
                ) : expenses?.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl p-12 text-center rounded-xl flex flex-col items-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <ShoppingBag className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No expenses found</h3>
                        <p className="text-gray-500 mt-1">Start by adding a new expense using the form.</p>
                    </div>
                ) : (
                    <ul className="space-y-3 pb-10">
                        {expenses?.map((expense, index) => (
                            <li
                                key={expense.id}
                                className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl p-4 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group relative"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <CategoryIcon category={expense.category} />

                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {expense.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                {expense.category}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(expense.date), 'MMMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right flex items-center gap-4">
                                        <span className="block text-lg font-bold text-gray-900">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete expense"
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === expense.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
