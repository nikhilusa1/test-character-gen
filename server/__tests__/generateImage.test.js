const request = require('supertest')
const app = require('../index')

jest.mock('../lib/nvidiaClient', () => ({
  generateImage: jest.fn().mockResolvedValue('data:image/png;base64,fakebase64'),
  assist: jest.fn(),
}))

const { generateImage } = require('../lib/nvidiaClient')

afterEach(() => jest.clearAllMocks())

test('POST /api/generate-image returns imageData on success', async () => {
  const res = await request(app)
    .post('/api/generate-image')
    .send({ prompt: 'Portrait of Aria, silver hair' })

  expect(res.status).toBe(200)
  expect(res.body.imageData).toBe('data:image/png;base64,fakebase64')
  expect(generateImage).toHaveBeenCalledWith('Portrait of Aria, silver hair')
})

test('POST /api/generate-image returns 400 if prompt is missing', async () => {
  const res = await request(app).post('/api/generate-image').send({})
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/prompt/)
})

test('POST /api/generate-image returns 500 on NVIDIA error', async () => {
  generateImage.mockRejectedValueOnce(new Error('NVIDIA timeout'))
  const res = await request(app)
    .post('/api/generate-image')
    .send({ prompt: 'Portrait of Aria' })
  expect(res.status).toBe(500)
  expect(res.body.error).toBeDefined()
})
