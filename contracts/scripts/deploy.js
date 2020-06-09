const synthetix = require('synthetix');
require('dotenv-safe').config();

async function main() {

  const network = process.env.BUIDLER_NETWORK

  const SYNTHETIX_ADDRESS = synthetix.getTarget({ network, contract: 'ProxyERC20' }).address
  const ADDRESS_RESOLVER = synthetix.getTarget({ network, contract: 'ReadProxyAddressResolver' }).address
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
  const Resolver = await ethers.getContractFactory("ImplementationResolver");
  const resolver = await Resolver.deploy(implementation.address, INITIAL_OWNER);
  await resolver.deployed();
  const Proxy = await ethers.getContractFactory("Proxy");
  let proxy = await Proxy.deploy(resolver.address);
  await proxy.deployed();
  proxy = new ethers.Contract(proxy.address, implementation.interface, deployer);
  await proxy.initialize(SYNTHETIX_ADDRESS, ADDRESS_RESOLVER);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
