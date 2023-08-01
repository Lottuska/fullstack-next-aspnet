# Backend: ASP.NET Core Web API .NET 6.0

## Description

Backend of "Book Application". This API has basic user authentication functionality made with ASP.NET Core Identity membership system and JSON Web Tokens (JWT). Also endpoints for different book-related actions, for example retrieving books or deleting a specific book.

## Table on Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)

## Installation

1. Clone the repository or download the ZIP.
2. Navigate to the project root folder.
3. Change appsettings.json to your own preferred settings:

```
    "AllowedOrigins": "http://localhost:3000",                      // URL where frontend is running
    "ConnectionStrings": {
        "DefaultConnection": "DataSource=app.db;Cache=Shared"       // Database, this one uses SQLlite
    },
    "JwtConfig": {
        "Secret": "",                                               // 50 characters long random string (can have lower and upper case and numbers)
        "AccessTokenExpirationTime": "00:05:00",                    // Preferred access token lifetime, e.g. 5 minutes
        "RefreshTokenExpirationTime": "07:00:00:00"                 // Preferred refresh token lifetime, e.g. 7 days
    }
```

4. Restore the required packages:

```
dotnet restore
```

5. Run migrations and update the database:

```
dotnet ef database update
```

## Usage

1. Open a terminal or command prompt.
2. Navigate to the project root folder.
3. Run the application:

```
dotnet run
```

## Endpoints

#### Authentication

- `POST /api/Authentication/Register`: Register a new user account.
  - Request body:
  ```
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- `POST /api/Authentication/Login`: Login with an existing user account.
  - Request body:
  ```
  {
    "email": "string",
    "password": "string"
  }
  ```
- `POST /api/Authentication/Logout`: Revoke a current refresh token.

  - Request body:

  ```
  {
    "refreshToken": "string"
  }
  ```

- `POST /api/Authentication/RefreshToken`: Refresh access token with logged in user's valid tokens.
  - Request body:
  ```
  {
    "token": "string",
    "refreshToken": "string"
  }
  ```

#### Books

- `GET /api/Books`: Retrieve a list of all books.
- `POST /api/Books`: Add a new book.
  - Request body:
  ```
  {
    "id": 0,
    "title": "string",
    "author": "string",
    "description": "string",
    "published": 0
  }
  ```
- `PATCH /api/Books`: Edit the description of an existing book.
  - Query Params:
  ```
  /api/Books?id={int}&description={string}
  ```
- `DELETE /api/Books`: Delete a book.
  - Query Params:
  ```
  /api/Books?id={int}
  ```
- `GET /api/Books/{id}`: Retrieve a specific book by ID.
