import { NextRequest, NextResponse } from 'next/server';
import { db, Expense } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schema
const expenseSchema = z.object({
    amount: z.number().positive(),
    category: z.string().min(1),
    description: z.string().min(1),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    idempotencyKey: z.string().optional(),
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'date_desc';

    let expenses = db.read();

    if (category) {
        expenses = expenses.filter(e => e.category === category);
    }

    if (sort === 'date_desc') {
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'date_asc') {
        expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = expenseSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { amount, category, description, date, idempotencyKey } = result.data;
        const expenses = db.read();

        // Idempotency check
        if (idempotencyKey) {
            const existing = expenses.find(e => e.idempotencyKey === idempotencyKey);
            if (existing) {
                return NextResponse.json(existing, { status: 200 }); // Return existing resource
            }
        }

        const newExpense: Expense = {
            id: uuidv4(),
            amount,
            category,
            description,
            date,
            createdAt: new Date().toISOString(),
            idempotencyKey
        };

        expenses.push(newExpense);
        db.write(expenses);

        return NextResponse.json(newExpense, { status: 201 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const success = db.delete(id);

        if (success) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}
