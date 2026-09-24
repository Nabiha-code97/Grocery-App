import 'dotenv/config'
import mongoose from 'mongoose'

await mongoose.connect(`${process.env.MONGO_URI}/greencart`)

const users = mongoose.connection.collection('users')
const requests = mongoose.connection.collection('signuprequests')

const VALID_ROLES = ['user', 'seller', 'admin']

// Anything that is not a recognised role becomes a plain customer: a missing
// role, or a legacy value such as "customer" that predates the current enum.
const notAValidRole = { $or: [{ role: { $exists: false } }, { role: { $nin: VALID_ROLES } }] }

// Sellers are identified by EITHER the legacy isSeller flag or an existing
// role:'seller', so accounts already carrying the role are not skipped.
const anySeller = { $or: [{ isSeller: true }, { role: 'seller' }] }

const missingShopName = {
    ...anySeller,
    $and: [{ $or: [{ shopName: { $in: [null, ''] } }, { shopName: { $exists: false } }] }]
}
const missingPhone = {
    ...anySeller,
    $and: [{ $or: [{ phone: { $in: [null, ''] } }, { phone: { $exists: false } }] }]
}

console.log('isSeller:true        ->', await users.countDocuments({ isSeller: true }))
console.log('role:seller          ->', await users.countDocuments({ role: 'seller' }))
console.log('invalid/missing role ->', await users.countDocuments(notAValidRole))
console.log('seller w/o shopName  ->', await users.countDocuments(missingShopName))
console.log('seller w/o phone     ->', await users.countDocuments(missingPhone))
console.log('pending signups      ->', await requests.countDocuments({}))
console.log('products w/o sellerId->', await mongoose.connection.collection('products').countDocuments({ sellerId: { $exists: false } }))

const roleBreakdown = await users.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]).toArray()
console.log('role breakdown       ->', JSON.stringify(roleBreakdown))

if (process.env.APPLY !== '1') {
    console.log('\ndry run only - set APPLY=1 to write')
    await mongoose.disconnect()
    process.exit(0)
}

await users.updateMany(missingShopName, [{ $set: { shopName: { $concat: ['$name', "'s Shop"] } } }])
await users.updateMany(missingPhone, { $set: { phone: 'N/A' } })

const promoted = await users.updateMany(anySeller, { $set: { role: 'seller', cartItem: {} } })
const backfilled = await users.updateMany(notAValidRole, { $set: { role: 'user' } })
const unset = await users.updateMany({}, { $unset: { isSeller: '' } })

let lowercased = 0
for await (const u of users.find({}, { projection: { email: 1 } })) {
    const lower = String(u.email).toLowerCase()
    if (lower !== u.email) {
        await users.updateOne({ _id: u._id }, { $set: { email: lower } })
        lowercased++
    }
}

await users.dropIndex('email_1').catch(e => console.log('email_1 already gone:', e.message))
await users.createIndex({ email: 1, role: 1 }, { unique: true })

const purged = await requests.deleteMany({})
await requests.dropIndexes().catch(() => {})

console.log({
    promoted: promoted.modifiedCount,
    backfilled: backfilled.modifiedCount,
    isSellerUnset: unset.modifiedCount,
    emailsLowercased: lowercased,
    signupRequestsPurged: purged.deletedCount
})

await mongoose.disconnect()
