const { expect } = require("chai");

const hashZero = "0x0000000000000000000000000000000000000000000000000000000000000000"
const hashOne = "0x0000000000000000000000000000000000000000000000000000000000000001"
const addressZero = "0x0000000000000000000000000000000000000000";

async function deployContracts () {
    const [signer, addr1] = await ethers.getSigners();
    // mocks
    const Synth = await ethers.getContractFactory("Synth");
    const synth = await Synth.deploy();
    await synth.deployed();
    const Synthetix = await ethers.getContractFactory("Synthetix");
    const synthetix = await Synthetix.deploy(synth.address);
    await synthetix.deployed();
    // source
    const Implementation = await ethers.getContractFactory("Implementation");
    const implementation = await Implementation.deploy();
    await implementation.deployed();
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(implementation.address, await signer.getAddress());
    await resolver.deployed();
    const Proxy = await ethers.getContractFactory("Proxy");
    let proxy = await Proxy.deploy(resolver.address);
    await proxy.deployed();
    proxy = new ethers.Contract(proxy.address, implementation.interface, signer);
    await proxy.initialize(synthetix.address, 0);
    return {
        signer,
        addr1,
        implementation,
        resolver,
        proxy,
        synth,
        synthetix
    }
}

describe("Implementation", function() {

  it("Should allow anyone to create newOrder", async function() {
    const { proxy, signer } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value:2
    });
    expect(((await proxy.orders(1)).submitter)).to.equal(await signer.getAddress());
  });

  it("Should allow an order submitter to cancelOrder", async function() {
    const { proxy, signer } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value:2
    });
    await proxy.cancelOrder(1);
    expect(((await proxy.orders(1)).submitter)).to.equal(addressZero);
  });

  it("Should allow anyone to a executeOrder only once", async function() {
    const { proxy, signer, addr1 } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value: ethers.utils.parseEther('1')
    });
    await proxy.connect(addr1).executeOrder(1);
    expect((await proxy.orders(1)).executed).to.equal(true);
    expect(proxy.executeOrder(1)).to.be.revertedWith("Order already executed")
  });

  it("Should refund exact gas cost after executeOrder", async function() {
    const { proxy, signer, addr1 } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value: ethers.utils.parseEther('1'),
    });
    let beforeBalance = await addr1.getBalance();
    await proxy.connect(addr1).executeOrder(1, {
      gasPrice:1
    });
    let afterBalance = await addr1.getBalance();
    expect(afterBalance.sub(1).sub(beforeBalance).toNumber()).to.equal(0);
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value: ethers.utils.parseEther('1000'),
    });
    beforeBalance = afterBalance;
    await proxy.connect(addr1).executeOrder(2, {
      gasPrice:ethers.utils.parseEther('0.001')
    });
    afterBalance = await addr1.getBalance();
    expect(afterBalance.sub(1).sub(beforeBalance).toNumber()).to.equal(0);
  });

  it("Should allow user to withdrawOrders", async function() {
    const { proxy, signer, addr1 } = await deployContracts()
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value: ethers.utils.parseEther('1'),
    });
    await proxy.connect(addr1).executeOrder(1, {
      gasPrice:1
    });
    await proxy.connect(signer).newOrder(hashZero, 1, hashOne, 1, 1, {
      value: ethers.utils.parseEther('1'),
    });
    await proxy.connect(addr1).executeOrder(2, {
      gasPrice:1
    });
    await proxy.withdrawOrders([1,2]);
    expect(((await proxy.orders(1)).submitter)).to.equal(addressZero);
    expect(((await proxy.orders(2)).submitter)).to.equal(addressZero);
  });

})