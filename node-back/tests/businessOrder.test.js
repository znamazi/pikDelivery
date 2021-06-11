const request = require('supertest')
const app = require('../src/app')
const Order = require('../src/models/Order')

const {
  businessUser,
  businessUserId,
  setupDatabase,
  businessId
} = require('./db')

beforeEach(async () => {
  await setupDatabase()
})

test('Should not add a new order for unauthenticated user', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})

test('Should not add a new order if email not exist', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})

// test('Should not add a new order if sender not exist in db', async () => {
//   const response = await request(app)
//     .post('/api/0.1/business/order')
//     .set({ Authorization: `Bearer ${businessUser.token}` })
//     .send({
//       senderModel: 'business',
//       sender: '5f55e3dd18f2171b8c3359ed',

//       email: 'tom7@gmail.com',
//       vehicleType: 'Car',
//       name: 'Tom Anderson',
//       mobile: 987456321,
//       packages: [
//         {
//           reference: '1235',
//           description: 'Package Item 1'
//         }
//       ]
//     })
//     .expect(200)
//   expect(response.body.success).toBe(false)
// })

// test('Should not add non-sender order', async () => {
//   const response = await request(app)
//     .post('/api/0.1/business/order')
//     .set({ Authorization: `Bearer ${businessUser.token}` })
//     .send({
//       senderModel: 'business',

//       email: 'tom7@gmail.com',
//       vehicleType: 'Car',
//       name: 'Tom Anderson',
//       mobile: 987456321,
//       packages: [
//         {
//           reference: '1235',
//           description: 'Package Item 1'
//         }
//       ]
//     })
//     .expect(200)
//   expect(response.body.success).toBe(false)
// })

test('Should not add non-senderModel order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})

test('Should not add non-vehicle order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add non-package order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add  empty package order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: ''
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add  empty array package order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: []
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add package with value empty order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: 123,
          description: 'Package Item 1'
        },
        {
          reference: '',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add package with miss item package order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})
test('Should not add non-name order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})

test('Should not add non-mobile order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,

      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(false)
})

test('Should add a new order', async () => {
  const response = await request(app)
    .post('/api/0.1/business/order')
    .set({ Authorization: `Bearer ${businessUser.token}` })
    .send({
      senderModel: 'business',
      sender: businessId,
      email: 'tom7@gmail.com',
      vehicleType: 'Car',
      name: 'Tom Anderson',
      mobile: 987456321,
      packages: [
        {
          reference: '1235',
          description: 'Package Item 1'
        }
      ]
    })
    .expect(200)
  expect(response.body.success).toBe(true)

  // Assert that the database was changed correctly
  const order = await Order.findById(response.body.order._id)
  expect(order).not.toBeNull()

  expect(order).toHaveProperty('confirmationCode')
  expect(order).toHaveProperty('time')
  expect(order).toHaveProperty('pickup')
  expect(order).toHaveProperty('delivery')
  expect(order).toHaveProperty('status')
  expect(order).toHaveProperty('receiver')
})
