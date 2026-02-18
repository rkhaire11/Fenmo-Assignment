'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { PlusCircle, Loader2, IndianRupee, Tag, FileText, Calendar } from 'lucide-react';

const expenseSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().min(1, "Description is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
    const queryClient = useQueryClient();
    const [idempotencyKey, setIdempotencyKey] = useState('');

    useEffect(() => {
        setIdempotencyKey(uuidv4());
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: undefined,
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: ExpenseFormValues) => {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, idempotencyKey }),
            });

            if (!res.ok) {
                throw new Error('Failed to create expense');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            reset();
            setIdempotencyKey(uuidv4());
        },
    });

    const onSubmit = (data: ExpenseFormValues) => {
        mutation.mutate(data);
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 sm:p-8 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <PlusCircle size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {mutation.isError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {mutation.error.message}. Retrying automatically...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <IndianRupee className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            disabled={mutation.isPending}
                            {...register('amount', { valueAsNumber: true })}
                            className={cn("mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 transition-all duration-200 pl-9", errors.amount && "border-red-300 focus:border-red-500 focus:ring-red-500")}
                            placeholder="0.00"
                        />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Tag className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                            {...register('category')}
                            disabled={mutation.isPending}
                            className={cn("mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 transition-all duration-200 pl-9", errors.category && "border-red-300 focus:border-red-500 focus:ring-red-500")}
                        >
                            <option value="">Select Category</option>
                            <option value="Food">Food & Dining</option>
                            <option value="Transport">Transportation</option>
                            <option value="Utilities">Bills & Utilities</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Health">Health & Wellness</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FileText className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            disabled={mutation.isPending}
                            {...register('description')}
                            className={cn("mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 transition-all duration-200 pl-9", errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500")}
                            placeholder="What was this for?"
                        />
                    </div>
                    {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="date"
                            disabled={mutation.isPending}
                            {...register('date')}
                            className={cn("mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 transition-all duration-200 pl-9", errors.date && "border-red-300 focus:border-red-500 focus:ring-red-500")}
                        />
                    </div>
                    {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 active:scale-95"
                >
                    {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                            Saving...
                        </span>
                    ) : (
                        'Add Expense'
                    )}
                </button>
            </form>
        </div>
    );
}
