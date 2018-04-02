pragma solidity ^0.4.18;


interface ISplitter {
	function getContractBalance() public view returns (uint256);

	function addRecipient(address _newRecipient) public;

	function split() public payable;

	function withdrawFrom(address _holder, uint256 _amount) public;
}