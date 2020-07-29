const synthetix = require('synthetix');

async function main() {

  const network = process.env.BUIDLER_NETWORK

  const SYNTHETIX_ADDRESS = synthetix.getTarget({ network, contract: 'ProxyERC20' }).address
  const INITIAL_OWNER = process.env.INITIAL_OWNER

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Implementation = await ethers.getContractFactory("Implementation");
  const implementation = await Implementation.deploy();
  await implementation.deployed();
  console.log('Implementation deployed at', implementation.address)
  const Resolver = await ethers.getContractFactory("ImplementationResolver");
  const resolver = await Resolver.deploy(implementation.address, INITIAL_OWNER);
  await resolver.deployed();
  console.log('Resolver deployed at', resolver.address)
  const Proxy = await ethers.getContractFactory("Proxy");
  let proxy = await Proxy.deploy(resolver.address);
  await proxy.deployed();
  console.log('Proxy deployed at', proxy.address)
  proxy = new ethers.Contract(proxy.address, implementation.interface, deployer);
  await proxy.initialize(SYNTHETIX_ADDRESS);

  console.log()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
