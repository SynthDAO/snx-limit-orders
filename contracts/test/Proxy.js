const { expect } = require("chai");

describe("Proxy", function() {

  it("Should forward transactions to implementation contract", async function() {

    const [signer] = await ethers.getSigners();
    const Implementation = await ethers.getContractFactory("ReturnString");
    const implementation = await Implementation.deploy();
    await implementation.deployed();
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(implementation.address, "0x0000000000000000000000000000000000000001");
    await resolver.deployed();
    const Proxy = await ethers.getContractFactory("Proxy");
    let proxy = await Proxy.deploy(resolver.address);
    proxy = new ethers.Contract(proxy.address, implementation.interface, signer);
    expect(await proxy.value()).to.equal("value");
  });
})