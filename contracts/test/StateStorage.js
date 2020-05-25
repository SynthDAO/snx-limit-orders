const { expect } = require("chai");

describe("StateStorage", function() {


    const addressZero = "0x0000000000000000000000000000000000000000";
    const hashZero = "0x0000000000000000000000000000000000000000000000000000000000000000"

  it("Should expose synthetixContract address after deployment", async function() {
    // We simulate a proxy contract address with an external account (signer)
    const [proxy] = await ethers.getSigners();
    const synthetixContract = "0x0000000000000000000000000000000000000001"
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy(synthetixContract);
    await stateStorage.deployed();
    expect(await stateStorage.synthetix()).to.equal(synthetixContract);
  });

  it("Should allow only the proxy address to createOrder", async function() {
    const [proxy, addr1] = await ethers.getSigners();
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy(addressZero);
    await stateStorage.deployed();
    await stateStorage.setProxy(await proxy.getAddress());
    await stateStorage.connect(proxy).createOrder(addressZero, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
    expect(await stateStorage.latestID()).to.equal(1);
    try {
        await stateStorage.connect(addr1).createOrder(addressZero, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
        expect(await stateStorage.latestID()).to.equal(1);
    } catch(e) {
        expect(await stateStorage.latestID()).to.equal(1);
    }
  });

  it("Should allow anyone to getOrder", async function() {
    const [proxy, addr1] = await ethers.getSigners();
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy(addressZero);
    await stateStorage.deployed();
    await stateStorage.setProxy(await proxy.getAddress());
    const submitter = "0x0000000000000000000000000000000000000001"
    await stateStorage.connect(proxy).createOrder(submitter, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
    expect((await stateStorage.connect(addr1).getOrder(1))[0]).to.equal(submitter);
  });

  it("Should allow only the proxy address to setOrder", async function() {
    const [proxy, addr1] = await ethers.getSigners();
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy(addressZero);
    await stateStorage.deployed();
    await stateStorage.setProxy(await proxy.getAddress());
    await stateStorage.connect(proxy).createOrder(addressZero, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
    const addressOne = "0x0000000000000000000000000000000000000001"
    await stateStorage.connect(proxy).setOrder(await stateStorage.latestID(), addressOne, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
    expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressOne);
    try {
      await stateStorage.connect(addr1).setOrder(await stateStorage.latestID(), addressZero, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
      expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressOne);
    } catch(e) {
      expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressOne);
    }
  });

  it("Should allow only the proxy address to deleteOrder", async function() {
    const [proxy, addr1] = await ethers.getSigners();
    const StateStorage = await ethers.getContractFactory("StateStorage");
    const stateStorage = await StateStorage.deploy(addressZero);
    await stateStorage.deployed();
    await stateStorage.setProxy(await proxy.getAddress());
    const addressOne = "0x0000000000000000000000000000000000000001"
    await stateStorage.connect(proxy).createOrder(addressOne, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
    await stateStorage.connect(proxy).deleteOrder(await stateStorage.latestID())
    expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressZero);
    try {
      await stateStorage.connect(proxy).createOrder(addressOne, hashZero, 1, hashZero, 1, 1, 1, 0, 0, false)
      await stateStorage.connect(addr1).deleteOrder(await stateStorage.latestID())
      expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressOne);
    } catch(e) {
      expect((await stateStorage.getOrder(await stateStorage.latestID()))[0]).to.equal(addressOne);
    }
  });
})