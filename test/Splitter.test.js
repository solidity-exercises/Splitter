const Splitter = artifacts.require('./fakes/SplitterFake.sol');

const assertRevert = require('./utils/assertRevert');
const watchEvent = require('./utils/watchEvent');

contract('Splitter', ([first, another, yetAnother, overTheMax]) => {
	let sut;

	before(() => {
		web3.eth.defaultAccount = first;
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
		await sut.addRecipient(another);
		await sut.split({ value: 1 });
		// Act
		const result = await sut.getContractBalance();
		// Assert
		assert.equal(result, 1);
	});

	it("getContractBalance Should return exact value after split and withdrawFrom functions invocation", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.addRecipient(yetAnother);
		await sut.split({ value: 3 });
		await sut.withdrawFrom(first, 1, { from: another });
		// Act
		const result = await sut.getContractBalance();
		// Assert
		assert.equal(result, 2);
	});

	it("addRecipient Should revert when trying to add more than MAX_RECIPIENTS_COUNT recipients", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.addRecipient(yetAnother);
		// Act
		const result = sut.addRecipient(overTheMax);
		// Assert
		await assertRevert(result);
	});

	it("addRecipient Should revert when trying to add already added recipient", async () => {
		// Arrange
		await sut.addRecipient(another);
		// Act
		const result = sut.addRecipient(another);
		// Assert
		await assertRevert(result);
	});

	it("addRecipient Should revert when passed invalid `_newRecipient` argument", async () => {
		// Arrange
		// Act
		const result = sut.addRecipient(0x00000000000000000000);
		// Assert
		await assertRevert(result);
	});

	it("addRecipient Should set allowance from `msg.sender` to `_newRecipient` to surplus one", async () => {
		// Arrange
		await sut.addRecipient(another);
		// Act
		const result = await sut.allowed(first, another);
		// Assert
		assert.equal(result, 1);
	});

	it("addRecipient Should add `_newRecipient` to `msg.sender` recipients array", async () => {
		// Arrange
		await sut.addRecipient(another);
		// Act
		const result = await sut.recipients(first, 0);
		// Assert
		assert.equal(result, another);
	});

	it("addRecipient Should raise LogNewRecipient event", async () => {
		// Arrange
		const event = sut.LogNewRecipient();
		const promiEvent = watchEvent(event);
		// Act
		await sut.addRecipient(another);
		const result = await promiEvent;
		event.stopWatching();
		// Assert
		assert.equal(result.args.holder, first);
		assert.equal(result.args.recipient, another);
	});

	it("split Should revert when `msg.sender` has no recipients", async () => {
		// Arrange
		// Act
		const result = sut.split({ value: 2 });
		// Assert
		await assertRevert(result);
	});

	it("split Should revert when the value send is less than recipients length", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.addRecipient(yetAnother);
		// Act
		const result = sut.split({ value: 1 });
		// Assert
		await assertRevert(result);
	});

	it("split Should return reminder", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.addRecipient(yetAnother);
		// Act
		await sut.split({ value: 3 });
		const result = await sut.allowed(sut.address, first);
		// Assert
		assert.equal(result, 1);
	});

	it("split Should set the exact split amount to every recipient", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.addRecipient(yetAnother);
		// Act
		await sut.split({ value: 3 });
		const reminder = await sut.allowed(sut.address, first);
		const anotherSplit = await sut.allowed(first, another);
		const yetAnotherSplit = await sut.allowed(first, yetAnother);
		// Assert
		assert.equal(reminder, 1);
		assert.equal(anotherSplit, 2);
		assert.equal(yetAnotherSplit, 2);
	});

	it("split Should raise LogSplit event", async () => {
		// Arrange
		const event = sut.LogSplit();
		const promiEvent = watchEvent(event);
		await sut.addRecipient(another);
		// Act
		await sut.split({ value: 1 });
		const result = await promiEvent;
		event.stopWatching();
		// Assert
		assert.equal(result.args.holder, first);
		assert.equal(result.args.splitAmount, 1);
	});

	it("withdrawFrom Should revert when `msg.sender` has not got enough allowance from `_holder`", async () => {
		// Arrange
		// Act
		const result = sut.withdrawFrom(another, 1);
		// Assert
		await assertRevert(result);
	});

	it("withdrawFrom Should decrease `msg.sender` allowance from `_holder` with exact amount", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.split({ value: 2 });
		const currentAllowance = await sut.allowed(first, another);
		// Act
		await sut.withdrawFrom(first, 1, { from: another });
		const newAllowance = await sut.allowed(first, another);
		// Assert
		assert.equal(currentAllowance, 3);
		assert.equal(newAllowance, 2);
	});

	it("withdrawFrom Should transfer `msg.sender` passed `_amount` value", async () => {
		// Arrange
		await sut.addRecipient(another);
		await sut.split({ value: 2 });
		const anotherCurrentBalance = await web3.eth.getBalance(another);
		// Act
		const estimate = await sut.withdrawFrom.estimateGas(first, 1, { from: another });

		const transactionReceipt = await sut.withdrawFrom(first, 1, { from: another });
		const transactionHash = transactionReceipt.tx;
		const transaction = await web3.eth.getTransaction(transactionHash);
		const currentTransactionGasPrice = transaction.gasPrice;
		const transactionCost = currentTransactionGasPrice.mul(estimate);

		const anotherNewBalance = await web3.eth.getBalance(another);
		const balanceDifference = anotherCurrentBalance.sub(anotherNewBalance);
		// Assert
		assert.deepEqual(balanceDifference, transactionCost.sub(1));
	});

	it("withdrawFrom Should raise LogWithdrawal event", async () => {
		// Arrange
		const event = sut.LogWithdrawal();
		const promiEvent = watchEvent(event);
		await sut.addRecipient(another);
		await sut.split({ value: 2 });
		// Act
		await sut.withdrawFrom(first, 1, { from: another });
		const result = await promiEvent;
		event.stopWatching();
		// Assert
		assert.equal(result.args.holder, first);
		assert.equal(result.args.recipient, another);
		assert.equal(result.args.withdrawalAmount, 1);
	});
});