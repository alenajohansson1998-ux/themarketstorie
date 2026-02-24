# AI Coding Agent Instructions

## Project Overview
This project is a CMS (Content Management System) for managing blog posts, categories, tags, and market data. It includes both an admin interface and public-facing pages. The backend is built with Next.js API routes, and the frontend uses React components. Data is stored in MongoDB and cached in Redis.

### Key Features

## Architecture

## Developer Workflows

### Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Testing Bulk Upload
  1. Navigate to `/admin/instruments`.
  2. Use `sample-price-bars.csv` from the `public/` directory.
  3. Upload the file and verify the data.
  1. Navigate to `/admin/market-lists/new`.
  2. Use the sample CSV template provided in the interface.
  3. Upload the file and verify the data.

### Debugging

## Project-Specific Conventions
  - **CSV Formats**: Ensure CSV files match the expected formats described in the [README.md](../README.md).

## External Dependencies

## Examples

## Notes