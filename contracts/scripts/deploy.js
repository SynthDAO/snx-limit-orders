// We require the Buidler Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
const bre = require("@nomiclabs/buidler");

async function main() {

  const SYNTHETIX_ADDRESS = process.env.SYNTHETIX_ADDRESS
  const FEE_RECLAMATION_WINDOW = process.env.FEE_RECLAMATION_WINDOW
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
  await proxy.initialize(SYNTHETIX_ADDRESS, FEE_RECLAMATION_WINDOW);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
