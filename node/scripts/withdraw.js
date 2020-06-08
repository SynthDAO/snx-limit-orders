const axios = require('axios');
const ethers = require('ethers')
const address = process.argv[2]
const amount = process.argv[3]

if(typeof address !== "string") throw new Error('Address must be given as a first argument')
if(typeof amount !== "string") throw new Error('Wei amount must be given as a first argument')

try {
    ethers.utils.getAddress(address);
} catch(e) {
    throw new Error("Invalid Ethereum address", e)
}

axios.post('http://127.0.0.1:8080/withdraw', {address, amount}).then((result)=>{
    console.log(result.status === 200? "Withdrawal request submitted successfully.": `Something went wrong. Status ${result.status}`)
}).catch((e)=>{
    console.error("Withdrawal request failed. Make sure node is already running.", e.message)
})