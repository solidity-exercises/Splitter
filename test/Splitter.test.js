const Splitter = artifacts.require('../contracts/Splitter.sol');

const assertRevert = require('./utils/assertRevert');
const watchEvent = require('./utils/watchEvent');

contract('Splitter', (accounts) => {
	let sut;

	before(() => {
		web3.eth.defaultAccount = accounts[0];
	});

	beforeEach(async () => {
		sut = await Splitter.new();
	});

	it("MAX_RECIPIENTS_COUNT constant Should have exact value", async () => {
		// Arrange
		// Act
		const result = await sut.MAX_RECIPIENTS_COUNT();
		// Assert
		assert.equal(result, 128);
	});

	it("getContractBalance Should return default value on contract instantiation", async () => {
		// Arrange
		const balanceDefaultValue = 0;
		// Act
		const result = await sut.getContractBalance();
		// Assert
		assert.equal(result, 0);
	});

	it("getContractBalance Should return exact value after split function invocation", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("getContractBalance Should return exact value after split and withdrawFrom functions invocation", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should revert when trying to add more than MAX_RECIPIENTS_COUNT recipients", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should revert when trying to add already added recipient", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should revert when passed invalid `_newRecipient` argument", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should set allowance from `msg.sender` to `_newRecipient` to surplus one", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should add `_newRecipient` to `msg.sender` recipients array", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("addRecipient Should raise LogNewRecipient event", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("split Should revert when `msg.sender` has no recipients", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("split Should revert when the value send is less than recipients length", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("split Should return reminder", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("split Should set the exact split amount to every recipient", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("split Should raise LogSplit event", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("withdrawFrom Should revert when `msg.sender` has not got enough allowance from `_holder`", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("withdrawFrom Should decrease `msg.sender` allowance from `_holder` with exact amount", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("withdrawFrom Should transfer `msg.sender` passed `_amount` value", async () => {
		// Arrange
		// Act
		// Assert
	});

	it("withdrawFrom Should raise LogWithdrawal event", async () => {
		// Arrange
		// Act
		// Assert
	});
});