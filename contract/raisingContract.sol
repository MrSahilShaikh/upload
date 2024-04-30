// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract raisingContract is AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    // defining access control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public superAdmin;
    address public contractCreator;
    uint256 public totalRaised;
    uint256 public feePercent = 10;
    uint256 public hardCap;
    uint256 public minContribution;
    uint256 public maxContribution;

    bool public raiseStarted;
    bool public raiseEnded;

    uint256 public numOfContributors;
    address[] public contributorsList;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public whitelist;
    bool public whitelistEnabled;
    mapping(address=>uint) public WhitelistAmount;

    //Events
    event raiseEndedEvent();
    event raiseStartedEvent();
    event HardCapIncreased(uint256 _newHardCap);
    event MinContributionSet(uint256 _min);
    event MaxContributionSet(uint256 _max);
    event totalContributed(
        address indexed _user,
        uint256 _value,
        uint256 _time
    );
    event WhitelistUpdated(address _account, bool _value);
    

    //Have to add gratRole for SuperAdmin
    constructor(
        address _admin,
        uint256 _hardcap,
        address _superAdmin,
        uint256 _maxContribution,
        uint256 _minContribution
    ) {
        superAdmin = _superAdmin;
        contractCreator = _admin;
        hardCap = _hardcap;
        minContribution = _minContribution;
        maxContribution = _maxContribution;

        _grantRole(ADMIN_ROLE, contractCreator);
        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
    }

    // Have to define access to the this admin and the superAdmin
    modifier adminOrsuperAdmin() {
        console.log("Contract Creator", contractCreator);
        console.log("SuperAdmin", superAdmin);
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have defined Roles"
        );
        _;
    }

    function startRaise() external adminOrsuperAdmin {
        require(!raiseStarted, "Raise already started");
        raiseStarted = true;
        emit raiseStartedEvent();
    }

    function endRaise() external adminOrsuperAdmin {
        require(!raiseEnded, "Raise already ended");
        raiseEnded = true;
        this.finaliseRaise();
        emit raiseEndedEvent();
    }

    // Enable the whitelist
    function enableWhitelist() external adminOrsuperAdmin {
        whitelistEnabled = true;
    }

    // Disable the whitelist
    function disableWhitelist() external adminOrsuperAdmin {
        whitelistEnabled = false;
    }

    // adding contributors to whitelist
    function addToWhitelist(address _account,uint _amount ) external onlyRole(ADMIN_ROLE) {
        whitelist[_account] = true;
        WhitelistAmount[_account]=_amount;
        emit WhitelistUpdated(_account, true);
    }

    // removing contributors to whitelist
    function removeFromWhitelist(address _account)
        external
        onlyRole(ADMIN_ROLE)
    {
        whitelist[_account] = false;
        emit WhitelistUpdated(_account, false);
    }

    function isContributor(address _address) internal view returns (bool) {
        for (uint256 i = 0; i < contributorsList.length; i++) {
            if (contributorsList[i] == _address) {
                return true;
            }
        }
        return false;
    }

    //Contributing tokens
    function contribute() external payable nonReentrant {
        require(raiseStarted && !raiseEnded, "Raise must be ongoing");
        require(
            msg.value >= minContribution &&
                msg.value != 0 &&
                msg.value <= maxContribution,
            "Contribution should be in between min and max"
        );

        // when whitelist contribution is enabled
        if (whitelistEnabled) {
            require(whitelist[msg.sender] == true, "Not a whiteList User");

            contributions[msg.sender] = contributions[msg.sender].add(
                msg.value
            );
            totalRaised = totalRaised.add(msg.value);
            numOfContributors++;

            //Add the contributor to the list if not already present
            if (!isContributor(msg.sender)) {
                contributorsList.push(msg.sender);
            }

            // when whitelist is disabled
        } else if (!whitelistEnabled) {
            contributions[msg.sender] = contributions[msg.sender].add(
                msg.value
            );
            totalRaised = totalRaised.add(msg.value);
            numOfContributors++;

            //Add the contributor to the list if not already present
            if (!isContributor(msg.sender)) {
                contributorsList.push(msg.sender);
            }
        }
        emit totalContributed(msg.sender, msg.value, block.timestamp);
    }

    // Finalising the tokens to all at the end
    function finaliseRaise() external payable nonReentrant adminOrsuperAdmin {
        raiseEnded = true;
        require(raiseEnded == true, "Raise not ended");
        require(totalRaised > 0, "RasiedAmout should not be zero");

        uint256 superAdminAmt;
        uint256 adminAmount;

        if (totalRaised < hardCap) {
            console.log("When totalRasied < hardCap");
            console.log("TotalRaised", totalRaised);

            //Calculating Admin and SuperAdmin to transfer when totalRaised < hardCap
            superAdminAmt = (totalRaised.mul(feePercent)).div(100);
            adminAmount = totalRaised.sub(superAdminAmt);
            console.log(
                "superAdminAmt When total rasied < hardcap ",
                superAdminAmt
            );
            console.log("adminAmount When total rasied < hardcap", adminAmount);

            //Admin fee transfer when totalRaised < hardCap
            bool trasnferAdminLessTotalRaise = payable(contractCreator).send(
                adminAmount
            );
            require(
                trasnferAdminLessTotalRaise,
                "Txn failed for the admin when total rasied < hardcap"
            );

            //superAdmin fee transfer when totalRaised < hardCap
            bool trasnferSuperAdminLessTotalRaise = payable(superAdmin).send(
                superAdminAmt
            );
            require(
                trasnferSuperAdminLessTotalRaise,
                "Txn failed for the Super Admin when total rasied < hardcap"
            );
        } else if (totalRaised > hardCap) {
            console.log("When totalRasied > hardCap");
            //require(totalRaised > hardCap,"TotalRaised is less than hardCap");
            console.log("TotalRaised", totalRaised);

            // Calculating Admin and SuperAdmin to transfer.
            superAdminAmt = (hardCap.mul(feePercent)).div(100);
            adminAmount = hardCap.sub(superAdminAmt);
            console.log(
                "superAdminAmt When total rasied > hardcap ",
                superAdminAmt
            );
            console.log("adminAmount When total rasied > hardcap", adminAmount);

            //Admin fee transfer when totalRaised > hardCap
            bool successTransferAdmin = payable(contractCreator).send(
                adminAmount
            );
            require(
                successTransferAdmin,
                "Txn failed for the admin when total rasied > hardcap"
            );

            //superAdmin fee transfer when totalRaised > hardCap
            bool sucessTransferSuperAdmin = payable(superAdmin).send(
                superAdminAmt
            );
            require(
                sucessTransferSuperAdmin,
                "Txn failed for the SuperAdmin when total rasied > hardcap"
            );

            //Returning the overflow value to the contributors
            uint256 refundAmountPerContributor = totalRaised.sub(hardCap).div(
                numOfContributors
            );
            console.log(
                "refundAmountPerContributor",
                refundAmountPerContributor
            );

            console.log("Checking every contributor");
            for (uint256 i = 0; i < numOfContributors; i++) {
                //address contributor = payable(address(uint160(i)));
                address contributor = contributorsList[i];
                console.log("contributor list", contributor);

                uint256 contribution = contributions[contributor];
                if (contribution > refundAmountPerContributor) {
                    require(
                        contributor != address(0) ||
                            contributor !=
                            0x0000000000000000000000000000000000000000,
                        "Not a valid address"
                    );
                    console.log("Are we really refunding to the users");
                    (bool contributorSend, ) = payable(contributor).call{
                        value: refundAmountPerContributor
                    }("");
                    string memory con1 = "Refund failed for contributor: ";
                    require(
                        contributorSend,
                        string(abi.encodePacked(con1, contributor))
                    );
                }
                console.log("return Amount", refundAmountPerContributor);
            }
        } else if (totalRaised == hardCap) {
            console.log("When totalRasied == hardCap");
            console.log("TotalRaised", totalRaised);

            // Calculating Admin and SuperAdmin to transfer.
            superAdminAmt = (hardCap.mul(feePercent)).div(100);
            adminAmount = hardCap.sub(superAdminAmt);
            console.log(
                "superAdminAmt When total rasied == hardcap ",
                superAdminAmt
            );
            console.log(
                "adminAmount When total rasied == hardcap",
                adminAmount
            );

            //Admin fee transfer when totalRaised > hardCap
            bool successTransferAdmin = payable(contractCreator).send(
                adminAmount
            );
            require(
                successTransferAdmin,
                "Txn failed for the admin when total rasied == hardcap"
            );

            //superAdmin fee transfer when totalRaised > hardCap
            bool sucessTransferSuperAdmin = payable(superAdmin).send(
                superAdminAmt
            );
            require(
                sucessTransferSuperAdmin,
                "Txn failed for the SuperAdmin when total rasied == hardcap"
            );
        }

        totalRaised = 0;
        numOfContributors = 0;
        raiseStarted = false;
        raiseEnded = true;
    }

    receive() external payable {
        revert("Contract does not accept direct payments");
    }

    // setter function for MinContribution
    function setMinContribution(uint256 _min) external onlyRole(ADMIN_ROLE) {
        minContribution = _min;
        emit MinContributionSet(_min);
    }

    // Adding multiple addresses to the whitelist at once with their respective contributions

    function addMultipleToWhitelist(
        address[] calldata _accounts,
        uint256[] calldata _contributions
    ) external onlyRole(ADMIN_ROLE) {
        require(
            _accounts.length == _contributions.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < _accounts.length; i++) {
            address account = _accounts[i];
            uint256 contribution = _contributions[i];

            whitelist[account] = true;
            emit WhitelistUpdated(account, true);

            // If the contribution is greater than 0, add it to the totalRaised
            if (contribution > 0) {
                contributions[account] = contributions[account].add(
                    contribution
                );
                totalRaised = totalRaised.add(contribution);
                numOfContributors++;

                // Add the contributor to the list if not already present
                if (!isContributor(account)) {
                    contributorsList.push(account);
                }

                // emit totalContributed(account, contribution, block.timestamp);
                emit totalContributed(
                    _accounts[i],
                    _contributions[i],
                    block.timestamp
                );
            }
        }
    }

    
    


    //setter function for MaxContribution
    function setMaxContribution(uint256 _max) external onlyRole(ADMIN_ROLE) {
        maxContribution = _max;
        emit MaxContributionSet(_max);
    }

    //setter function for increaseHardCap
    function increaseHardCap(uint256 _newHardCap)
        external
        onlyRole(ADMIN_ROLE)
    {
        hardCap = _newHardCap;
        emit HardCapIncreased(_newHardCap);
    }

    // setter function for changingHardcap
    function setHardCap(uint256 _hardCap) external onlyRole(ADMIN_ROLE) {
        hardCap = _hardCap;
    }

    // setter function for changingFeePercentage
    function setFeePercent(uint256 _feePercent) external onlyRole(ADMIN_ROLE) {
        feePercent = _feePercent;
    }

    // // getContract Balance
    // function getContractBalance() public view returns(uint){
    //     return address(this).balance;
    // }
}
