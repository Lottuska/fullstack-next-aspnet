# Frontend: Next.js 13

## Description

Frontend of "Book Application". This application has basic user authentication functionality and some pages for only logged in users for handling book-related data.

## Table on Contents

- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)

## Installation

1. Clone the repository or download the ZIP.
2. Navigate to the project root folder.
3. Install the depencies:

```
npm install
```

## Usage

1. Open a terminal or command prompt.
2. Navigate to the project root folder.
3. Change URL in .env to URL of your own API:

```
API_BASE_URL=https://localhost:7147     // URL where backend is running, e.g localhost:7147
```

4. Run the development server:

```
npm run dev
```

## Folder Structure

- `api`: Contains the components that handle connection between the API and the frontend.
- `app`: Contains the folders and the pages, where folders are used to define routes and files are used to create the UI shown for the route.
  - `_components`: Components used on the pages (other than those directly related to the API).
