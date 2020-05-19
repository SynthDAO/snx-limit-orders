const { expect } = require("chai");

const hashZero = "0x0000000000000000000000000000000000000000000000000000000000000000"
const hashOne = "0x0000000000000000000000000000000000000000000000000000000000000001"

async function deployContracts () {
    const [signer] = await ethers.getSigners();
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy("0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002");
    await stateStorage.deployed();
    const Implementation = await ethers.getContractFactory("Implementation");
    const implementation = await Implementation.deploy();
    await implementation.deployed();
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(implementation.address, await signer.getAddress());
    await resolver.deployed();
    const Proxy = await ethers.getContractFactory("Proxy");
    let proxy = await Proxy.deploy(resolver.address, stateStorage.address);
    await proxy.deployed();
    await stateStorage.setProxy(proxy.address);
    proxy = new ethers.Contract(proxy.address, implementation.interface, signer);
    return {
        signer,
        stateStorage,
        implementation,
        resolver,
        proxy
    }
}

describe("Implementation", function() {

  it("Should allow anyone to create newOrder", async function() {
    const { proxy, stateStorage, signer } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1);
    expect((await stateStorage.getOrder(1)[0])).to.equal(await signer.getAddress());
  });

})