# Secure Group Messaging System

## Overview
This project implements a secure group messaging system that supports both private and open groups, user authentication, messaging, and basic security features such as message encryption. The backend is built using Node.js and utilizes MongoDB for data storage.

## Features
- User authentication (registration and login)
- Group management (creation, joining, leaving, and banishment)
- Messaging functionality (sending and retrieving messages)
- Message encryption using AES-128
- Error handling and logging

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB Atlas account (for database)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd secure-group-messaging
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   DATABASE_URL=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Start the server:
   ```
   npm start
   ```

## API Documentation

### Authentication Routes
- **POST /register**
  - Request Body: `{ "email": "user@example.com", "password": "yourpassword" }`
  - Response: `{ "token": "jwt_token" }`

- **POST /login**
  - Request Body: `{ "email": "user@example.com", "password": "yourpassword" }`
  - Response: `{ "token": "jwt_token" }`

### Group Management Routes
- **POST /groups**
  - Request Body: `{ "name": "Group Name", "type": "private/open", "maxMembers": 10 }`
  - Response: `{ "groupId": "group_id" }`

- **POST /groups/join**
  - Request Body: `{ "groupId": "group_id" }`
  - Response: `{ "message": "Join request submitted" }`

- **DELETE /groups/leave**
  - Request Body: `{ "groupId": "group_id" }`
  - Response: `{ "message": "Left the group" }`

### Messaging Routes
- **POST /messages**
  - Request Body: `{ "groupId": "group_id", "message": "Your message" }`
  - Response: `{ "message": "Message sent" }`

- **GET /messages**
  - Query Parameters: `groupId=group_id`
  - Response: `[ { "senderId": "user_id", "content": "encrypted_message", "timestamp": "2023-01-01T00:00:00Z" } ]`

## Known Issues
- Real-time messaging functionality is not implemented but can be added using WebSockets.
- Additional validation and error handling may be required for production readiness.

## AI-Based Tools Used
- Utilized AI-based coding tools for generating boilerplate code, enhancing productivity, and debugging.

## License
This project is licensed under the MIT License.