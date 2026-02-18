async function testApi() {
    const baseUrl = 'http://localhost:3003/api/expenses';

    console.log('Testing GET /api/expenses...');
    try {
        const res = await fetch(baseUrl);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`GET failed: ${res.status} ${text}`);
        }
        const data = await res.json();
        console.log('GET success. Data:', data);
    } catch (e) {
        console.error(e);
    }

    console.log('Testing POST /api/expenses...');
    try {
        const expense = {
            amount: 42.50,
            category: 'Food',
            description: 'Test Lunch',
            date: new Date().toISOString()
        };

        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`POST failed: ${res.status} ${text}`);
        }
        const data = await res.json();
        console.log('POST success. Created:', data);
    } catch (e) {
        console.error(e);
    }
}

testApi();
