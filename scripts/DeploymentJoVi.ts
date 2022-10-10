import { ethers } from 'ethers';
import { Ballot__factory, MyToken__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

async function main() {
   
  const provider = new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY);
  const lastBlock = await provider.getBlock("latest");
  //console.log({lastBlock});
  const privateKey: string = process.env.PRIVATE_KEY as string;
  
  console.log("Deploying Tokenized Ballot");
  const wallet = await new ethers.Wallet( privateKey, provider);
  const signer = wallet.connect(provider);
  const publickey: string = process.env.PUBLIC_KEY as string;
  const ballotFactory = new MyToken__factory();
  const ballotContract = await ballotFactory.connect(signer).deploy();
  await ballotContract.deployed();
  console.log(ballotContract.address)
  //Mint tokens
  const mint = await ballotContract.mint(signer.address, 1);
  await mint.wait(5)
  console.log(`Minting.... Txhash ${mint.hash}`)
  // Get current total supply 
  let totalvotes = await ballotContract.getPastTotalSupply(lastBlock.number)
  console.log(`Current total votes ${totalvotes}`)
  // Get past total supply
  let pastvotes = await ballotContract.getPastTotalSupply(lastBlock.number)
  console.log(`Votes in block ${lastBlock} is ${totalvotes}`)
  // let txdDelegate = await ballotContract.delegate(signer.address)
  // let nonce = await ballotContract.nonces(signer.address)
  // console.log(`Nonce for ${signer.address} is ${nonce.toNumber()}`) 
  // let tx = await ballotContract.checkpoints(signer.address , nonce)
  // console.log(tx)


  //Transfer votings 
  let addressdelegate = "0x1163211534733bbB25797Bbc420FB5c9cF59056F"
  let txdDelegate2 = await ballotContract.delegate(addressdelegate)
  console.log(`Vote delegated to ${addressdelegate}`)
  // Check Voting Delegates 
  let checkingdelegate = await  ballotContract.delegates(signer.address)
  console.log(`The account ${signer.address} already delegated to ${addressdelegate}`)


  // Check for all votings maded 
  
  // const giveRightToVoteTx3 = await ballotContract.giveRightToVote(assignedVoters[2], {gasLimit: 5000000});
  //   const giveRightToVote3TxReceipt = await giveRightToVoteTx3.wait();
  //   console.log(`${assignedVoters[2]} has succesfully received voting rights`);
  //   console.log({giveRightToVote3TxReceipt});



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});