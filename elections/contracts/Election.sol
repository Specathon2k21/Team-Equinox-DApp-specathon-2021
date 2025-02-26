pragma solidity >=0.4.22 <0.7.0;

contract Election {
    
    enum ElectionState {CREATED, OPEN, ENDED}
    
    uint public noOfElections;
    uint public noOfUsers;
    
    constructor() public {
        noOfElections=0;
        noOfUsers=0;
    }

    struct election{
        uint id;
        ElectionState state;
        string option1;
        string option2;
        uint optCount1;
        uint optCount2;
        bool isPermissionLess;
        uint256 expiryTime;
        string description;
        address creator;
        mapping(address => bool) voted;
    }
    
    struct user{
        address userAddress;
        string name;
    }
    
    mapping(address => user) public users;
    mapping(address => bool) public registrations;
    
    mapping(uint => election) public elections;
    
    modifier electionActive (uint _id) {
        require(
            elections[_id].state == ElectionState.OPEN
        );
        _;
    }
    
    modifier electionCreator (address _creator, uint _id) {
        require(
            elections[_id].creator == _creator
        );
        _;
    }
    
    function register(string memory _name) public {
        require(registrations[msg.sender]!=true);
        noOfUsers++;
        users[msg.sender].userAddress=msg.sender;
        users[msg.sender].name=_name;
        registrations[msg.sender]=true;
    }
    
    function createElection(string memory _c1, string memory _c2, bool _permission, string memory _description, uint256 _expiry) public{
        require(registrations[msg.sender]);
        noOfElections++;
        elections[noOfElections].id=noOfElections;
        elections[noOfElections].option1=_c1;
        elections[noOfElections].option2=_c2;
        elections[noOfElections].state=ElectionState.OPEN;
        elections[noOfElections].optCount1=0;
        elections[noOfElections].optCount2=0;
        elections[noOfElections].isPermissionLess=_permission;
        elections[noOfElections].expiryTime=_expiry;
        elections[noOfElections].description=_description;
        elections[noOfElections].creator=msg.sender;
    }
    
    //TODO Ensure not more than one votes are counted
    function vote(uint _electionId, uint _choice) electionActive(_electionId) public{
        require(registrations[msg.sender]);
        require(elections[_electionId].voted[msg.sender]==false);
        if(_choice==1){
            elections[_electionId].optCount1++;
        }
        else if(_choice==2){
            elections[_electionId].optCount2++;
        }
        elections[_electionId].voted[msg.sender]=true;
    }
    
    function closeElection(uint _electionId) electionActive(_electionId) electionCreator(msg.sender, _electionId) public {
        elections[_electionId].state = ElectionState.ENDED;
    }

    function getNumberOfUsers() public view returns (uint){
        return noOfUsers;
    }

    function getNumberOfElection() public view returns (uint){
        return noOfElections;
    }
    
}
