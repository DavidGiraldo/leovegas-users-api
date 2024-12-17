# User Management API

## Overview

This API provides user management functionalities, including authentication and authorization. It allows clients to create, read, update, and delete users, as well as handle user login and token management.

The API is built using Node.js with TypeScript and follows a modular architecture, separating concerns into controllers, services, middleware, and repositories.

### Architecture/Structure Diagram

![Architecture Diagram](./img/Diagram.png)

### Database ER Diagram

![Database ER Diagram](./img/Tables.jpg)

## Getting Started

### Prerequisites

- **Node.js** installed (LTS latest Version v22.12.0)
- **NPM** package manager
- **Docker** installed (for running the MySQL database)

### Setting Up the Database

To start a MySQL database using Docker, run the following commands:

```bash
docker pull mysql
docker run --name mysql-dg-lv -e MYSQL_ROOT_PASSWORD=yutany -e MYSQL_DATABASE=dg-lv-users-db -p 3306:3306 -d mysql:latest
```

### Installing Dependencies and Running Migrations

Install the project dependencies:

```bash
npm install
```

Run the database migrations:

```bash
npm run drizzle:migrate
```

### Starting the API

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3333`.

## API Endpoints

Below are the available endpoints with sample cURL commands for testing.

### Health Check

Checks the health status of the API.

- **Endpoint:** `GET /api/health`

```bash
curl --location 'http://localhost:3333/api/health'
```

### Create User

Creates a new user.

- **Endpoint:** `POST /api/users/`
- **Headers:** `Content-Type: application/json`

```bash
curl --location 'http://localhost:3333/api/users/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 28,
    "role": "USER"
  }'
```

### User Login

Authenticates a user and returns an access token.

- **Endpoint:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`

```bash
curl --location 'http://localhost:3333/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get User by Email

Retrieves user details by email. Requires authentication.

- **Endpoint:** `GET /api/users/{email}`
- **Headers:**
  - `Authorization: Bearer {accessToken}`

```bash
curl --location 'http://localhost:3333/api/users/john@example.com' \
--header 'Authorization: Bearer eyJhbGciOiJ...'
```

### Update User

Updates user information. Requires authentication.

- **Endpoint:** `PUT /api/users/{email}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {accessToken}`

```bash
curl --location --request PUT 'http://localhost:3333/api/users/john@example.com' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1N...' \
--data '{
    "name": "John Doe",
    "role": "USER"
  }'
```

### Delete User

Deletes a user by email. Requires authentication.

- **Note:** Administrators cannot delete themselves.

- **Endpoint:** `DELETE /api/users/{email}`
- **Headers:**
  - `Authorization: Bearer {accessToken}`

```bash
curl --location --request DELETE 'http://localhost:3333/api/users/john@example.com' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI...'
```

### List Users with Pagination

Retrieves a paginated list of users. Requires authentication.

- **Endpoint:** `GET /api/users/`
- **Headers:**
  - `Authorization: Bearer {accessToken}`
- **Query Parameters:**
  - `page` (default: 1)
  - `pageSize` (default: 10)

```bash
curl --location 'http://localhost:3333/api/users/?page=1&pageSize=10' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1...'
```

## Notes

- Replace `eyJhbGciOiJ...` with the actual access token obtained from the login endpoint.

## Code Structure

The project follows a modular architecture:

- **Controllers** handle incoming HTTP requests and return responses.
- **Services** contain the business logic and interact with repositories.
- **Repositories** handle data access and queries to the database.
- **Middleware** manage request preprocessing like authentication and authorization.

### Routes
`start/routes.ts`
- Defines the HTTP routes for the API.


### Controllers

#### Users Controller
`app/controllers/users_controller.ts`
- Handles user-related requests.

#### Auth Controller
`app/controllers/auth_controller.ts`
- Handles authentication requests.


### Services

#### Users Service
`app/services/users_service.ts`
- Contains business logic related to users.


#### Auth Service
`app/services/auth_service.ts`
- Contains business logic related to authentication.


### Middleware

#### Auth Middleware
`app/middleware/auth_middleware.ts`
- Verifies the JWT access token and extracts the user session.


#### Role Validator Middleware
`app/middleware/role_validator_middleware.ts`
- Ensures that users have the correct permissions for the requested operation.


### Models and Repositories

#### Users Repository
`app/models/users/repository.ts`
- Handles database operations related to users.


#### Auth Repository
`app/models/auth/repository.ts`
- Handles database operations related to authentication tokens.

## Testing

The project includes comprehensive functional tests that verify the behavior of all API endpoints. These tests ensure that the API works correctly and maintains its expected functionality.

### Running Tests

Before running the tests, ensure that the MySQL database is running, as the functional tests require a database connection.

You can use any of the following commands to run the tests:

- `npm run test` will execute: `node ace test`
- `npm run test:functional` will execute: `node ace test --functional`
- `npm run test:watch` will execute: `node ace test --watch`

### Test Coverage

The functional tests cover all major endpoints and scenarios, including:

- User creation
- User authentication (login)
- User retrieval
- User updates
- User deletion
- Paginated user listing
- Error handling
- Authentication validation
- Authorization rules
- Input validation

### Test Results

All functional tests have been verified to pass successfully:

![Passed Tests](./img/PassedTests.jpg)
