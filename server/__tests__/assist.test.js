const request = require('supertest')
const app = require('../index')

jest.mock('../lib/nvidiaClient', () => ({
  generateImage: jest.fn(),
  assist: jest.fn().mockResolvedValue('She grew up in the shadow of a collapsed empire.'),
}))

const { assist } = require('../lib/nvidiaClient')

afterEach(() => jest.clearAllMocks())

test('POST /api/assist returns suggestion on success', async () => {
  const res = await request(app).post('/api/assist').send({
    field: 'backstory',
    character: { name: 'Aria', sheet: { personality: { traits: ['brave'] } } },
  })
  expect(res.status).toBe(200)
  expect(res.body.suggestion).toBe('She grew up in the shadow of a collapsed empire.')
})

test('POST /api/assist returns 400 if field is missing', async () => {
  const res = await request(app).post('/api/assist').send({ character: {} })
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/field/)
})

test('POST /api/assist returns 400 if character is missing', async () => {
  const res = await request(app).post('/api/assist').send({ field: 'backstory' })
  expect(res.status).toBe(400)
})

test('POST /api/assist returns 500 on NVIDIA error', async () => {
  assist.mockRejectedValueOnce(new Error('LLM unavailable'))
  const res = await request(app).post('/api/assist').send({
    field: 'backstory',
    character: { name: 'Aria', sheet: { personality: { traits: [] } } },
  })
  expect(res.status).toBe(500)
})
