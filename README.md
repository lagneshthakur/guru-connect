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
   AES_SECRET_KEY=<your_aes_secret_key>
   PORT=3000
   ```

4. Start the server:
   ```
   npm start
   ```

## API Documentation
- Refer to swagger docs available at /api-docs
- Use Postman or any API client to test the endpoints. POSTman docs are available at - 
  ```
  https://documenter.getpostman.com/view/19044245/2sB2j999fz
  ```

## Docker

### Steps to Run the Project via Docker

1. **Build the Docker Image**  
   Run the following command to build the Docker image:
   ```
   docker build -t guru-connect .
   ```

2. **Run the Docker Container**  
   Use the following command to run the container:
   ```
   docker run -p 3000:3000 --env-file .env guru-connect
   ```

   - `-p 3000:3000`: Maps port 3000 of the container to port 3000 on your host machine.
   - `--env-file .env`: Passes the environment variables from your `.env` file to the container.

3. **Access the Application**  
   Once the container is running, you can access the application at:
   ```
   http://localhost:3000
   ```

4. **Stop the Container**  
   To stop the running container, find its container ID using:
   ```
   docker ps
   ```
   Then stop it using:
   ```
   docker stop <container_id>
   ```

### Notes
- Ensure that your `.env` file is in the root directory and contains the required environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
- If you are using MongoDB Atlas, make sure your IP address is whitelisted in the MongoDB Atlas network settings.

## Known Issues
- Real-time messaging functionality is not implemented but can be added using WebSockets.
- Additional validation and error handling may be required for production readiness.

## AI-Based Tools Used
- Utilized AI-based coding tools for generating boilerplate code, enhancing productivity, and debugging.

## License
This project is licensed under the MIT License.