const { expect } = require("chai");

describe("ImplementationResolver", function() {

  it("Should store the initial implementation and owner after deployment", async function() {

    const initialImplementation = "0x0000000000000000000000000000000000000001"
    const initialOwner = "0x0000000000000000000000000000000000000002"
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(initialImplementation, initialOwner);
    
    await resolver.deployed();
    expect(await resolver.getImplementation()).to.equal(initialImplementation);
    expect(await resolver.owner()).to.equal(initialOwner);
  });

  it("Should allow only the current owner to changeOwnership", async function() {

    const [owner, newOwner] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress()
    const newOwnerAddress = await newOwner.getAddress()

    const initialImplementation = "0x0000000000000000000000000000000000000001"
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(initialImplementation, ownerAddress);
    
    await resolver.deployed();
    await resolver.connect(owner).changeOwnership(newOwnerAddress);
    expect(await resolver.owner()).to.equal(newOwnerAddress);
    try {
      await resolver.connect(owner).changeOwnership(ownerAddress);
      expect(await resolver.owner()).to.equal(newOwnerAddress);
    } catch(e) {
      expect(await resolver.owner()).to.equal(newOwnerAddress);
    }
  });

  it("Should allow only the current owner to upgrade the implementation", async function() {

    const [owner, addr1] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress()

    const initialImplementation = "0x0000000000000000000000000000000000000001"
    const Resolver = await ethers.getContractFactory("ImplementationResolver");
    const resolver = await Resolver.deploy(initialImplementation, ownerAddress);
    
    await resolver.deployed();

    const newImplementation = "0x0000000000000000000000000000000000000002"

    await resolver.connect(owner).upgrade(newImplementation);
    expect(await resolver.getImplementation()).to.equal(newImplementation);
    try {
      await resolver.connect(addr1).upgrade(initialImplementation);
      expect(await resolver.getImplementation()).to.equal(newImplementation);
    } catch(e) {
      expect(await resolver.getImplementation()).to.equal(newImplementation);
    }
  });
});
