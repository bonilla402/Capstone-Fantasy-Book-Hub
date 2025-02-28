# Book Club Hub

[![Deploy](https://img.shields.io/badge/Deployed%20Site-Online-green)](https://frontend-fantasy-book-hub.onrender.com/books)

**Book Club Hub** is a full-stack web platform built for fantasy book enthusiasts. It allows users to explore an extensive collection of fantasy literature, track their reading, review books, and engage with other readers through discussions and groups. The platform fosters an interactive community where users can connect over shared interests, participate in trading and selling books, and collaborate in book-based discussions.

---

## 🚀 Key Features

### 📚 Book Exploration & Reviews
- **Book Catalog & Search**: Discover and filter books by title, author, and genre.
- **Detailed Book Pages**: View book covers, author details, and categorized topics.
- **Review & Rating System**: Leave and read reviews to build a community-driven recommendation system.

### 📥 Open Library API Integration
- **Data Source:** The **[Open Library API](https://openlibrary.org/developers/api)** was used to **gather the initial dataset of fantasy books**.
- **Top 100 Books Pulled:** The **top 100 rated fantasy books** were fetched from Open Library and stored in the database.
- **Additional Metadata:** Book covers, author names, and publication years were sourced from Open Library.

### 👥 Community & Social Engagement
- **User Profiles**: Track your reading progress and contributions.
- **Discussion Groups**: Join or create groups to engage in book-related discussions.
- **Group Discussions**: Start structured conversations about books and themes.

### 🔐 Security & Authentication
- **JWT-Based Authentication**: Secure user accounts with role-based permissions.
- **Role-Based Access**: Moderators and admins manage groups and discussions.

---

## 🏆 Standard User Flow

A typical user journey on **Book Club Hub** looks like this:

1. **Explore Books** 📖
    - Users land on the homepage and can browse through the **top-rated fantasy books**.
    - They can **search by book title, author, or topic** to find books of interest.

2. **View Book Details** 🔍
    - Clicking on a book takes users to a detailed **book page** with its **cover, author, topics, and reviews**.
    - If logged in, they can **add a review or rate the book**.

3. **Sign Up / Log In** 🔑
    - To participate fully, users must **create an account** or log in.
    - Account creation requires **a username, email, and password**.

4. **Join or Create a Group** 👥
    - Users can **browse, join, or create book discussion groups**.
    - Each group has **dedicated discussions** for specific books or topics.

5. **Participate in Discussions** 💬
    - Within groups, users can **start new discussions** or **reply to ongoing conversations**.
    - Moderators and admins can **manage group discussions**.

6. **Review & Track Books** ⭐
    - Users can **leave reviews**, edit their opinions, or **track books** they have read or plan to read.
    - The review system **helps other readers discover books**.

7. **Future Features** 🔄
    - Users will eventually be able to **trade or sell books**, gaining access to a growing book exchange community.

---

## 🛠 Installation Guide

### 📌 Prerequisites
Before installing the project, ensure you have the following installed:
- **[PostgreSQL](https://www.postgresql.org/download/)** (Database)
- **[Node.js](https://nodejs.org/)** (v16+ recommended)
- **npm** (comes with Node.js)

### 🔧 Frontend Installation
To set up the frontend, follow these steps:

1. **Navigate to the project root folder (where `package.json` is located):**
   ```sh
   cd path/to/project
   ```

2. **Install frontend dependencies:**
   ```sh
   npm install
   ```

3. **Start the frontend development server:**
   ```sh
   npm start
   ```
    - The frontend should now be running on `http://localhost:3000`.

---

### 🔧 Backend Installation
To set up the backend, follow these steps:

1. **Navigate to the backend folder:**
   ```sh
   cd backend
   ```

2. **Install backend dependencies:**
   ```sh
   npm install
   ```

3. **Set up the database:**
    - Ensure PostgreSQL is running.
    - Create a PostgreSQL database and configure your `.env` file.

4. **Run the database migrations and seed data:**
   ```sh
   node seedDatabase.js
   ```
    - This script populates the database with **books, users, and discussions**.

5. **Run the test database seed script (optional, for running tests):**
   ```sh
   node seedTestDatabase.js
   ```

6. **Start the backend server:**
   ```sh
   npm start
   ```
    - The server should now be running on `http://localhost:3001` (or as configured in `.env`).

---

## 🛠 Tech Stack

### Backend:
- **Node.js & Express.js**: REST API for book and user management.
- **PostgreSQL**: Stores books, users, reviews, and discussions.
- **JWT Authentication**: Secure login and user roles.
- **Open Library API**: Used to gather the **top 100 rated fantasy books** and fetch metadata from **[Open Library](https://openlibrary.org/developers/api)**.

### Frontend:
- **React & React Router**: UI development and navigation.
- **Axios**: Handles data fetching from the backend.
- **CSS Modules**: Provides scoped component styling.

---

## 🧪 Running Tests

The project includes **unit and integration tests** using **Jest**. Most test files are located **next to the file they test**, following the naming convention:

```
example:
bookModel.js  →  bookModel.test.js
groupRoutes.js  →  groupRoutes.test.js
```

### 📌 Running Tests
- **Frontend tests**: Run at the root level with:
  ```sh
  npm test
  ```
- **Backend tests**: Navigate into the backend folder and run:
  ```sh
  cd backend
  npm test
  ```

These tests help ensure **code reliability, feature correctness, and API stability**.

---

## 📅 Roadmap
- ✅ Implement book reviews and discussion groups.
- ⏳ Add trading and selling system for books.
- ⏳ Introduce a user reputation system.
- ⏳ Enable book sharing and social media integration.

---

## 📜 License
This project is licensed under the **MIT License**.

---

✨ **Visit the live site:** [Book Club Hub](https://frontend-fantasy-book-hub.onrender.com/books) ✨

**Book Club Hub** is an evolving project aimed at bringing fantasy book lovers together. Contributions are welcome to improve the platform and make it the ultimate hub for fantasy readers!
