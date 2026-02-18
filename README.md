# Expense Tracker

A simple personal finance tool to record and review expenses. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Features

-   **Add Expense**: Record amount, category, description, and date.
-   **View Expenses**: List displayed with filtering by category and sorting by date.
-   **Summary**: Total amount calculation.
-   **Resilience**: Handles network retries and prevents double submissions using idempotency keys.

## Tech Stack

-   **Framework**: Next.js 14
-   **Styling**: Tailwind CSS
-   **State Management**: React Query (TanStack Query) - mainly for caching and easy retries.
-   **Form Handling**: React Hook Form + Zod validation.
-   **Persistence**: JSON file (`data/expenses.json`).
    -   *Why?*: Initially planned to use Prisma + SQLite, but opted for a simple JSON file store to avoid native dependency issues in the development environment and to ensure portability for this assignment. It's sufficient for a single-user local tool.

## Key Design Decisions

1.  **React Query**: Used for data fetching to easily handle loading states, caching, and *retries* (a key requirement for unreliable networks).
2.  **Idempotency**: The frontend generates a unique `idempotencyKey` for each expense submission. The backend checks this key to prevent creating duplicate entries if the user (or React Query) retries the request.
3.  **Server-Side Filtering**: Filtering and sorting are implemented on the API side to mimic a real-world scenario where the dataset might be too large for client-side processing.

## Trade-offs & Omissions

-   **Persistence**: A real production app would use a proper database (PostgreSQL/SQLite). The current JSON implementation is not concurrency-safe for multiple users but works for a single-user demo.
-   **Authentication**: Omitted as per the assignment scope.
-   **Testing**: Added a basic API test script (`scripts/test-api.js`) but skipped comprehensive unit/E2E tests due to time constraints.
-   **UI Polish**: The UI is functional and clean but could be improved with better mobile responsiveness and loading skeletons.

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

-   `GET /api/expenses?category=Food&sort=date_desc`
-   `POST /api/expenses`
