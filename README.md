# JotForm Integration with Next.js

This application integrates the JotForm API with a Next.js application to:

- Automatically create a new database table for each new JotForm.
- Insert submitted form data into the corresponding database table.
- Provide a web page to show the list of JotForms.
- Create individual pages for each JotForm, embedding the form for users to use.

## Prerequisites

- Node.js and npm
- PostgreSQL database
- JotForm API key

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/jotform-integration.git
   cd jotform-integration
