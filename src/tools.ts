// src/tools.ts

import db from '../src/dataBase.js'

export type GetTopSellingBooksArgs = {
  year: number
}

export type GetBookPriceArgs = {
  book_title: string
  year: number
}

export type GetWeatherArgs = {
  city: string
}

type BookSaleRow = {
  book_title: string
  total_sales: number
}

type BookPriceRow = {
  price: number
}
type Location = {
  city: string
  weather: string
}

export function getTopSellingBooks(args: GetTopSellingBooksArgs): string {
  const { year } = args

  console.log(`[SQL] Top sellers for ${year}`)

  const rows = db
    .prepare(
      `
    SELECT
      book_title,
      total_sales
    FROM book_sales
    WHERE year = ?
    ORDER BY total_sales DESC
    LIMIT 10
  `,
    )
    .all(year) as BookSaleRow[]

  if (!rows.length) {
    return `No data for ${year}`
  }

  return rows.map((row) => `${row.book_title} (${row.total_sales})`).join(', ')
}

export function getBookPrice(args: GetBookPriceArgs): string {
  const { book_title, year } = args

  console.log(`[SQL] Price for ${book_title}`)

  const row = db
    .prepare(
      `
    SELECT price
    FROM book_prices
    WHERE
      book_title LIKE ?
      AND year = ?
  `,
    )
    .get(`%${book_title}%`, year) as BookPriceRow | undefined

  if (!row) {
    return 'Price not found'
  }

  return `${book_title} cost ${row.price} ILS`
}

export function getWeather(args: GetWeatherArgs): string {
  const { city } = args

  console.log(`[Weather] ${city}`)

  const locations: Location[] = [
    { city: 'London', weather: 'Rainy' },
    { city: 'Tel Aviv', weather: 'Sunny' },
  ]

  const normalizedCity = city.trim().toLowerCase().replace(/-/g, ' ')
  const match = locations.find(
    (item) => item.city.trim().toLowerCase() === normalizedCity,
  )

  return match ? match.weather : 'Weather not found'
}

export const toolFunctions = {
  get_top_selling_books: getTopSellingBooks,
  get_book_price: getBookPrice,
  get_weather: getWeather,
}
