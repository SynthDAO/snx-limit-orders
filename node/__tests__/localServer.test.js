const Server = require('../src/localServer')
const express = require('express')

jest.mock('express');

test('Should call withdrawCallback on incoming withdraw request', async (done) => {
    const input = {
        address:"0x0000000000000000000000000000000000000001",
        amount:"1"
    }
    express.mockReturnValue({
        use: jest.fn(),
        listen: jest.fn(),
        post: jest.fn((location, cb) => {
            cb({
                body: input,
            },{
                end: jest.fn()
            })
            done()
        })
    })
    const mockCallback = jest.fn(() => {done()})
    Server(mockCallback)
    const output = mockCallback.mock.calls[0][0]
    expect(input).toStrictEqual(output)
})