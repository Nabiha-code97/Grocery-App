import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Address from '../models/Address.js'
import SignUpRequest from '../models/SignUpRequest.js'

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Password123'

if (process.env.APPLY !== '1') {
    console.log('This DESTROYS all users, products, orders, addresses and signup requests,')
    console.log('then inserts fresh seed data.')
    console.log('\nRe-run with APPLY=1 to proceed:  APPLY=1 node scripts/seed.js')
    process.exit(0)
}

await mongoose.connect(`${process.env.MONGO_URI}/greencart`, { serverSelectionTimeoutMS: 20000 })
const db = mongoose.connection.db

// ---------------------------------------------------------------- wipe
for (const name of ['users', 'products', 'orders', 'addresses', 'signuprequests', 'categories']) {
    const res = await db.collection(name).deleteMany({})
    console.log(`cleared ${name}: ${res.deletedCount}`)
}

// The unique index on email alone predates per-role accounts and would stop
// one address from holding both a customer and a seller account.
await db.collection('users').dropIndex('email_1').catch(() => {})
await db.collection('signuprequests').dropIndexes().catch(() => {})
await User.syncIndexes()
await SignUpRequest.syncIndexes()
await Product.syncIndexes()
console.log('indexes synced:', JSON.stringify(await db.collection('users').indexes()))

// ---------------------------------------------------------------- users
const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

const sellers = await User.create([
    { name: 'Ayesha Khan', email: 'greenfarm@shop.com', passwordHash, role: 'seller', shopName: 'Green Farm Produce', phone: '0300-1112233' },
    { name: 'Bilal Ahmed', email: 'dailymart@shop.com', passwordHash, role: 'seller', shopName: 'Daily Mart', phone: '0321-4455667' },
])

const customers = await User.create([
    { name: 'Sara Malik', email: 'sara@shop.com', passwordHash, role: 'user' },
    { name: 'Hamza Tariq', email: 'hamza@shop.com', passwordHash, role: 'user' },
])

// Same address, both roles - proves the compound (email, role) index works.
const dual = await User.create([
    { name: 'Zoya Iqbal', email: 'zoya@shop.com', passwordHash, role: 'user' },
    { name: 'Zoya Iqbal', email: 'zoya@shop.com', passwordHash, role: 'seller', shopName: "Zoya's Bakery", phone: '0333-9988776' },
])

console.log(`users: ${sellers.length} sellers, ${customers.length} customers, ${dual.length} dual-role (same email)`)

// ---------------------------------------------------------------- products
const img = (file) => [`/seed/${file}`]

const catalogue = [
    // Green Farm Produce - fruit & veg
    [0, 'Potato 500g', 'Fresh organic potatoes, ideal for curries and fries.', 25, 20, 'Vegetables', 'potato_image_1.png'],
    [0, 'Tomato 1kg', 'Juicy ripe tomatoes, rich in Vitamin C.', 40, 35, 'Vegetables', 'tomato_image.png'],
    [0, 'Carrot 500g', 'Sweet crunchy carrots, great for salads and juice.', 45, 38, 'Vegetables', 'carrot_image.png'],
    [0, 'Spinach 250g', 'Farm fresh spinach, packed with iron.', 20, 15, 'Vegetables', 'spinach_image_1.png'],
    [0, 'Apple 1kg', 'Crisp red apples, hand picked.', 120, 105, 'Fruits', 'apple_image.png'],
    [0, 'Orange 1kg', 'Sweet and tangy oranges, full of Vitamin C.', 90, 80, 'Fruits', 'orange_image.png'],
    [0, 'Banana 1 dozen', 'Naturally ripened bananas.', 60, 50, 'Fruits', 'banana_image_1.png'],
    [0, 'Mango 1kg', 'Seasonal Sindhri mangoes, sweet and pulpy.', 150, 130, 'Fruits', 'mango_image_1.png'],

    // Daily Mart - dairy, grains, drinks, instant
    [1, 'Amul Milk 1L', 'Pasteurised toned milk, rich and creamy.', 70, 65, 'Dairy', 'amul_milk_image.png'],
    [1, 'Paneer 200g', 'Soft fresh paneer, perfect for curries.', 180, 165, 'Dairy', 'paneer_image.png'],
    [1, 'Eggs 12 pcs', 'Farm fresh eggs, high in protein.', 220, 200, 'Dairy', 'eggs_image.png'],
    [1, 'Basmati Rice 5kg', 'Long grain aged basmati rice.', 1400, 1250, 'Grains', 'basmati_rice_image.png'],
    [1, 'Wheat Flour 5kg', 'Stone ground chakki atta.', 850, 780, 'Grains', 'wheat_flour_image.png'],
    [1, 'Coca Cola 1.5L', 'Chilled soft drink, best served cold.', 150, 135, 'Drinks', 'coca_cola_image.png'],
    [1, 'Pepsi 1.5L', 'Refreshing cola drink.', 150, 130, 'Drinks', 'pepsi_image.png'],
    [1, 'Maggi Noodles 4pk', 'Two minute masala noodles.', 220, 195, 'Instant', 'maggi_image.png'],
    [1, 'Top Ramen 5pk', 'Instant curry flavour noodles.', 250, 225, 'Instant', 'top_ramen_image.png'],

    // Zoya's Bakery - the dual-role seller
    [2, 'Brown Bread', 'Freshly baked wholemeal brown bread.', 120, 100, 'Bakery', 'brown_bread_image.png'],
]

const sellerDocs = [sellers[0], sellers[1], dual[1]]

const products = await Product.create(
    catalogue.map(([sellerIdx, name, description, price, offerPrice, category, file]) => ({
        name, description, price, offerPrice, category,
        image: img(file),
        inStock: true,
        sellerId: sellerDocs[sellerIdx]._id,
    }))
)
console.log(`products: ${products.length}`)

// ---------------------------------------------------------------- addresses
const addresses = await Address.create([
    { userId: String(customers[0]._id), firstName: 'Sara', lastName: 'Malik', email: 'sara@shop.com', street: '12 Gulberg Main Blvd', city: 'Lahore', state: 'Punjab', zipcode: 54000, country: 'Pakistan', phone: '0301-2223344' },
    { userId: String(customers[1]._id), firstName: 'Hamza', lastName: 'Tariq', email: 'hamza@shop.com', street: '44 Clifton Block 5', city: 'Karachi', state: 'Sindh', zipcode: 75600, country: 'Pakistan', phone: '0302-5556677' },
    { userId: String(dual[0]._id), firstName: 'Zoya', lastName: 'Iqbal', email: 'zoya@shop.com', street: '7 F-8 Markaz', city: 'Islamabad', state: 'ICT', zipcode: 44000, country: 'Pakistan', phone: '0333-9988776' },
])
console.log(`addresses: ${addresses.length}`)

// ---------------------------------------------------------------- orders
const byName = (n) => products.find(p => p.name === n)
const lineTotal = (items) => items.reduce((sum, i) => sum + byName(i.n).offerPrice * i.q, 0)

const withTax = (items) => {
    const base = lineTotal(items)
    return base + Math.floor(base * 0.02)
}
const toItems = (items) => items.map(i => ({ product: String(byName(i.n)._id), quantity: i.q }))

const orderSpecs = [
    // single-seller order (Green Farm)
    { user: customers[0], addr: addresses[0], items: [{ n: 'Potato 500g', q: 2 }, { n: 'Apple 1kg', q: 1 }], paymentType: 'COD', isPaid: false, status: 'Delivered' },
    // single-seller order (Daily Mart), paid online
    { user: customers[1], addr: addresses[1], items: [{ n: 'Amul Milk 1L', q: 3 }, { n: 'Basmati Rice 5kg', q: 1 }], paymentType: 'Online', isPaid: true, status: 'Shipped' },
    // MULTI-seller order - spans Green Farm + Daily Mart
    { user: customers[0], addr: addresses[0], items: [{ n: 'Tomato 1kg', q: 2 }, { n: 'Maggi Noodles 4pk', q: 1 }], paymentType: 'COD', isPaid: false, status: 'Processing' },
    // customer side of the dual-role account buying from someone else
    { user: dual[0], addr: addresses[2], items: [{ n: 'Orange 1kg', q: 1 }, { n: 'Eggs 12 pcs', q: 2 }], paymentType: 'Online', isPaid: true, status: 'Order Placed' },
    { user: customers[1], addr: addresses[1], items: [{ n: 'Brown Bread', q: 2 }], paymentType: 'COD', isPaid: false, status: 'Out for Delivery' },
]

const orders = await Order.create(orderSpecs.map(s => ({
    userId: String(s.user._id),
    items: toItems(s.items),
    amount: withTax(s.items),
    address: String(s.addr._id),
    paymentType: s.paymentType,
    isPaid: s.isPaid,
    status: s.status,
})))
console.log(`orders: ${orders.length} (1 spans two sellers)`)

console.log('\n--- seeded logins (password for all: ' + SEED_PASSWORD + ') ---')
console.log('SELLER    greenfarm@shop.com   Green Farm Produce')
console.log('SELLER    dailymart@shop.com   Daily Mart')
console.log('CUSTOMER  sara@shop.com')
console.log('CUSTOMER  hamza@shop.com')
console.log('BOTH      zoya@shop.com        customer + seller on ONE email')
console.log('ADMIN     ' + process.env.SUPER_ADMIN_EMAIL + '  (from .env, at /admin/login)')

await mongoose.disconnect()
