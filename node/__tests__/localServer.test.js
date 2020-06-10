const Server = require('../src/localServer')
const axios = require('axios').default

test('Should call withdrawCallback on incoming withdraw request', async (done) => {
    const mockCallback = jest.fn(() => {done()})
    const server = Server(mockCallback)
    const input = {
        address:"0x0000000000000000000000000000000000000001",
        amount:"1"
    }
    try {
        await axios.post('http://localhost:7000/withdraw', input)
    } catch(e) {}
    server.close()
    const output = mockCallback.mock.calls[0][0]
    expect(input).toStrictEqual(output)
})