pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import '../node_modules/zeppelin-solidity/contracts/lifecycle/Destructible.sol';


contract Splitter is Destructible {
	using SafeMath for uint256;

	event LogNewRecipient(address indexed holder, address indexed recipient);
	event LogSplit(address indexed holder, uint256 splitAmount);
	event LogWithdrawal(address indexed holder, address indexed recipient, uint256 withdrawalAmount);
	
	mapping (address=>address[]) public recipients;
	mapping (address=>mapping(address=>uint256)) public allowed; // pull

	/**
	* @dev Declare maximum recipients count in order
	* to put upper bound on the for cycle/ dynamic array size
	*/
	uint8 public constant MAX_RECIPIENTS_COUNT = 128;

	modifier recipientsCountRestricted() {
		require(recipients[msg.sender].length <= MAX_RECIPIENTS_COUNT);
		_;
	}

	modifier isNewRecipient(address _recipientToCheck) {
		require(allowed[msg.sender][_recipientToCheck] == 0);
		_;
	}

	modifier hasRecipients() {
		require(recipients[msg.sender].length > 0);
		_;
	}

	modifier hasSentEnoughToSplit() {
		require(msg.value >= recipients[msg.sender].length);
		_;
	}

	modifier hasEnoughAllowance(address _from, uint256 _amount) {
		require(allowed[_from][msg.sender].sub(1) >= _amount);
		_;
	}

	function getContractBalance() public view returns (uint256) {
		return address(this).balance;
	}

	function addRecipient(address _newRecipient) public recipientsCountRestricted isNewRecipient(_newRecipient) {
		require(_newRecipient != address(0));

		/**
		* @dev Surplus one allows us to avoid storing boolean variable to check
		* whether the `msg.sender` already has such a recipient.
		*/
		allowed[msg.sender][_newRecipient] = allowed[msg.sender][_newRecipient].add(1);

		recipients[msg.sender].push(_newRecipient);

		LogNewRecipient(msg.sender, _newRecipient);
	}

	function split() public payable hasRecipients hasSentEnoughToSplit {
		uint256 reminder = msg.value % recipients[msg.sender].length;
		if (reminder != 0) {
			allowed[address(this)][msg.sender] = allowed[address(this)][msg.sender].add(reminder);  // return back the tip
		}

		uint256 amountToSplit = msg.value.div(recipients[msg.sender].length);

		for (uint8 i = 0; i < recipients[msg.sender].length; i++) {
			allowed[msg.sender][recipients[msg.sender][i]] = allowed[msg.sender][recipients[msg.sender][i]].add(amountToSplit);
		}

		LogSplit(msg.sender, amountToSplit);
	}

	function withdrawFrom(address _holder, uint256 _amount) public hasEnoughAllowance(_holder, _amount) {
		allowed[_holder][msg.sender] = allowed[_holder][msg.sender].sub(_amount);

		msg.sender.transfer(_amount);

		LogWithdrawal(_holder, msg.sender, _amount);
	}
}