# Task Management App

## Overview

The **Task Management App** is a powerful and intuitive application designed to help users organize and track their daily tasks efficiently. Built with **Ionic Angular** (Frontend) and **Node.js/Express.js** (Backend) with **PostgreSQL** as the database, this app ensures seamless task management with security and real-time notifications using **Firebase**.

## Features

### ✅ User Authentication & Profile Management
- Secure user registration and login using **bcrypt** and **JWT** authentication.
- Personalized task management for each user.

### ✅ Task Management
- Create new tasks with a title and description.
- Set due dates and reminders for tasks.
- Mark tasks as Complete or Cancel.
- Tasks automatically change to Incomplete if due date passes while in Pending status.
- Assign priority levels: High, Medium, or Low.
- View task details, edit tasks, or delete tasks.

### ✅ Task Statuses
- **Pending** – Task is created but not yet completed.
- **Complete** – Task is successfully finished.
- **Cancelled** – Task is canceled by the user.
- **Incomplete** – Task due date has passed while still in pending status.

### ✅ Analytics & Insights
- View **comprehensive task analytics** to track progress.
- Percentage breakdown of **Completed**, **Cancelled**, **Incomplete**, and **Pending** tasks.
- Task priority distribution visualization.
- Beautiful and interactive **charts** (Line, Bar, Pie, Doughnut) powered by **Chart.js**.

### ✅ Birthday Reminder
- Users can add their birthday date.
- The app will count down and send a birthday wish on the special day.

### ✅ Push Notifications
- Firebase integration for **task reminders and birthday notifications**.
- Stay updated with alerts for due and overdue tasks.

## Tech Stack

### Frontend:
- **Ionic Angular** – Modern UI with mobile-first approach.
- **Local Storage** – Store user preferences and session data securely.
- **Crypto-JS** – Encryption for secure data handling.
- **Chart.js** – Interactive data visualization.

### Backend:
- **Node.js & Express.js** – Robust and scalable API.
- **PostgreSQL** – Reliable relational database.
- **bcrypt & JWT** – Secure authentication.

### Other Integrations:
- **Firebase** – Real-time push notifications.

## Installation

### Prerequisites:
- **Node.js** and **npm** installed.
- **PostgreSQL** database setup.
- **Ionic CLI** installed globally (npm install -g @ionic/cli).

### Backend Setup:
1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/task-management-app.git
    cd task-management-app/backend
   ```

2. Install dependencies:

    ```bash
    npm install
   ```

3. Set up .env file with database credentials and JWT secret.

4. Run the server:

    ```bash
    node src/server.js
   ```

### Frontend Setup:
1. Navigate to the frontend directory:

    ```bash
    cd ../frontend
   ```

2. Install dependencies:

    ```bash
    npm install
   ```

3. Run the Ionic app:

    ```bash
    ionic serve
   ```

## Usage
1. Register/Login to create an account.
2. Start adding and managing tasks.
3. Set due dates and priorities for better organization.
4. Monitor task progress through analytics and charts.
5. Get real-time notifications for upcoming deadlines and birthdays.

## Security & Performance
- Encrypted user data using **Crypto-JS**.
- Secure authentication with **bcrypt & JWT**.
- Optimized database queries for fast performance.

## License
- This project is open-source and available under the **MIT License**.