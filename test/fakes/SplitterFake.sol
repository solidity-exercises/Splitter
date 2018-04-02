pragma solidity ^0.4.18;

import '../../contracts/Splitter.sol';


contract SplitterFake is Splitter {
	modifier recipientsCountRestricted() {
		require(recipients[msg.sender].length < 2);
		_;
	}
}