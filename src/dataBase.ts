// src/database.ts

import Database from 'better-sqlite3'

const db = new Database(':memory:')

db.exec(`
CREATE TABLE book_prices (
  book_title TEXT,
  year INTEGER,
  price REAL
);

CREATE TABLE book_sales (
  book_title TEXT,
  year INTEGER,
  total_sales INTEGER
);
`)

const books = [
  'Learn Python',
  'Learn JavaScript',
  'The Professional MySQL Guide',
]

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

for (const book of books) {
  for (let year = 2020; year <= 2025; year++) {
    const price = Number(random(120, 180).toFixed(2))
    const monthlySales = Math.floor(random(20, 100))

    db.prepare(
      `
      INSERT INTO book_prices
      VALUES (?, ?, ?)
    `,
    ).run(book, year, price)

    db.prepare(
      `
      INSERT INTO book_sales
      VALUES (?, ?, ?)
    `,
    ).run(book, year, monthlySales * 12)
  }
}

export default db
