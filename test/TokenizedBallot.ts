import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, should }   from "chai";
import { ContractFactory } from "ethers";
import { ethers }   from "hardhat";
import { MyToken }  from "../typechain-types";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings"

const DEFAULT_ADMIN_ROLE: string = '0x0000000000000000000000000000000000000000000000000000000000000000';
const tokenName: string = 'MyToken';
const tokenSymbol: string = 'MTK';
const amountToMint: number = 1000000;



describe("Tokenized Ballot - Unit tests" , function(){
    let tokenizedBallotContract: MyToken;
    let tokenizedBallotFactory: ContractFactory;
    let accounts: SignerWithAddress[];

    before(async function() {

        accounts = await ethers.getSigners();
        tokenizedBallotFactory = await ethers.getContractFactory("MyToken");

    });

    beforeEach(async function(){
    
        tokenizedBallotContract = await tokenizedBallotFactory.deploy() as MyToken; // It wasn't working without it 
        await tokenizedBallotContract.deployed();
        
   });

    describe("When the contract is deployed" , function() {
        it("deploys with proper access control" , async function() {
            
            const tokenizedBallotAdmin = await tokenizedBallotContract.hasRole(DEFAULT_ADMIN_ROLE, accounts[0].address);
            expect(tokenizedBallotAdmin).to.equal(true);

            const minterRole = ethers.utils.keccak256(toUtf8Bytes("MINTER_ROLE"));
            const tokenizedBallotMinter = await tokenizedBallotContract.hasRole(minterRole, accounts[0].address);
            expect(tokenizedBallotMinter).to.equal(true);

            const tokenizedBallotMinter1 = await tokenizedBallotContract.hasRole(minterRole, accounts[1].address);
            expect(tokenizedBallotMinter1).to.equal(false);

        });

        it("deploys with proper name and symbol" , async function() {
            const contractsName = await tokenizedBallotContract.name();
            expect(contractsName).to.equal(tokenName);

            const contractsSymbol = await tokenizedBallotContract.symbol();
            expect(contractsSymbol).to.equal(tokenSymbol);
        });
        

    });
    describe("After deployment", function() {

        it("can mint voting tokens", async function() {

            await tokenizedBallotContract.connect(accounts[0]).mint(accounts[1].address, amountToMint);

            const account1Balance = await tokenizedBallotContract.balanceOf(accounts[1].address);
            expect(account1Balance).to.equal(amountToMint);

        });

        it("does not allow user w/o minter role to mint voting tokens", async function() {

            await expect(tokenizedBallotContract.connect(accounts[1]).mint(accounts[1].address, amountToMint))
            .to.rejected;

        });

        it("can transfer voting tokens", async function() {

            await tokenizedBallotContract.connect(accounts[0]).mint(accounts[1].address, amountToMint);

            await tokenizedBallotContract.connect(accounts[1]).transfer(accounts[2].address, amountToMint/2);

            const account1Balance = await tokenizedBallotContract.balanceOf(accounts[1].address);
            expect(account1Balance).to.equal(amountToMint/2);

            const account2Balance = await tokenizedBallotContract.balanceOf(accounts[1].address);
            expect(account2Balance).to.equal(amountToMint/2);

        });

        it("can delegate voting power", async function() {

            await tokenizedBallotContract.delegate(accounts[1].address);

            const account0Delegate = await tokenizedBallotContract.delegates(accounts[0].address);
            expect(account0Delegate).to.equal(accounts[1].address);


        });

        it("can cast votes based on current block holdings", async function() {

           

        });

        it("can cast votes based on past block holdings", async function() {

            //let currentBlock = await ethers.provider.getBlockNumber();
            //console.log({currentBlock});
            
            await ethers.provider.send("hardhat_mine", ["0x100"]); //mines 256 blocks

            //currentBlock = await ethers.provider.getBlockNumber();
            //console.log({currentBlock});

        });

        it("can query results", async function() {



        });

    });
})