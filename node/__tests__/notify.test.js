const Notify = require('../src/notify')
const axios = require('axios').default

jest.mock('axios');

test('lowBalance should call webhook url', async (done) => {
    const inputWebhook = "https://google.com"
    const inputAddress = "0x0000000000000000000000000000000000000001"
    const mockPost = jest.fn((location, data) => done())
    axios.create.mockReturnValue({
        post: mockPost
    });
    const notify = Notify(inputWebhook)
    notify.lowBalance(inputAddress)
    expect(mockPost.mock.calls[0][0]).toBe('/');
    expect(mockPost.mock.calls[0][1]).toStrictEqual({
        message:`Limit order execution node balance too low. Please refill some ETH at ${inputAddress}`
    });

})