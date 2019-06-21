pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract FDOS {
    using SafeMath for uint256;

    mapping (address => uint256) public serialNumber;
    mapping (uint256 => address) public addressOfEatery;

    mapping (uint256 => string) public eateryName;
    mapping (uint256 => string) public area1;
    mapping (uint256 => string) public area2;
    mapping (uint256 => string) public area3;

    mapping (uint256 => uint8) public menuNum;
    mapping (uint256 => mapping (uint8 => string)) public menuName;
    mapping (uint256 => mapping (uint8 => uint32)) public menuCharge;
    mapping (uint256 => bool) public open;

    mapping (uint256 => uint256) public orderNumber;
    mapping (uint256 => mapping(uint256 => uint8)) public orderMenu;
    mapping (uint256 => mapping(uint256 => string)) public orderArea1;
    mapping (uint256 => mapping(uint256 => string)) public orderArea2;
    mapping (uint256 => mapping(uint256 => string)) public orderArea3;

    address public owner;
    uint256 public numberOfEatery;
    uint256 public balance;

    constructor () public{
        owner = msg.sender;
        numberOfEatery = 0;
    }

    function registerEatery (string _name, string _area1, string _area2, string _area3) public returns (bool success){
        serialNumber[msg.sender] = numberOfEatery;
        addressOfEatery[numberOfEatery] = msg.sender;


        orderNumber[numberOfEatery] = 0;
        eateryName[numberOfEatery] = _name;
        area1[numberOfEatery] = _area1;
        area2[numberOfEatery] = _area2;
        area3[numberOfEatery] = _area3;

        menuNum[numberOfEatery] = 0;
        numberOfEatery = numberOfEatery.add(1);
        return true;
    }
    
    function addMenu (string _menuName, uint32 _menuCharge) public returns (bool success){
        require(serialNumber[msg.sender] > 0);

        uint256 mySerial = serialNumber[msg.sender];
        menuNum[mySerial] = menuNum[mySerial] + 1;
        uint8 myNum = menuNum[mySerial];
        menuName[mySerial][myNum] = _menuName;
        menuCharge[mySerial][myNum] = _menuCharge;
        return true;
    }

    function openEatery () public {
        require(serialNumber[msg.sender] > 0 && menuNum[serialNumber[msg.sender]] > 0);
        open[serialNumber[msg.sender]] = true;
    }

    function closeEatery () public {
        require(open[serialNumber[msg.sender]] == true);
        open[serialNumber[msg.sender]] = false;
    }

    function showEatery(string _area2, string _area3) public view returns(uint256[] serial){
        require(numberOfEatery > 0);
        uint256[] memory serials;
        uint256 n = 0;
        uint256 present = 0;
        while( n < numberOfEatery ){
            if(keccak256(area2[n]) == keccak256(_area2)  && keccak256(area3[n]) == keccak256(_area3)){
                serials[present] = serialNumber[addressOfEatery[n]];
                present += 1;
            }
            n += 1;
        }
        return serials;
    }

    function order(uint256 _serial, uint8[] _menus) public payable returns (bool){
        require(open[_serial] == true && msg.value > 0);

        uint256 totalCharge = 0;
        for(uint i = 0; i < _menus.length; i++){
            totalCharge =totalCharge.add(menuCharge[_serial][_menus[i]]);
        }

        if( totalCharge != msg.value){   // not equal value!
            return false;
        }

        addressOfEatery[_serial].transfer(msg.value);
        return true;
    }
    

/*
    function showMenus(uint256 _serial) public returns(menuSet[] a){
        menuSet[] memory menuSets;
        for(uint8 i = 1; i <= menuNum[_serial]; i++){
            menuSets[i-1].menuName = menuName[_serial][i];
            menuSets[i-1].menuCharge = menuCharge[_serial][i];
        }
        return menuSets;
    }
*/

    function addOrderNumber() public returns(bool){
        orderNumber[serialNumber[msg.sender]] = orderNumber[serialNumber[msg.sender]].add(1);
        return true;
    }

    function getEateryName(uint256 _serial) public returns(string){
        return eateryName[_serial];
    }

    function getMenuNum(uint256 _serial) public view returns(uint8){
        return menuNum[_serial];
    }
    
    function getMenuName(uint256 _serial, uint8 _menuNum) public view returns(string){
        return menuName[_serial][_menuNum];
    }

    function getMenuCharge(uint256 _serial, uint8 _menuNum) public view returns(uint32){
        return menuCharge[_serial][_menuNum];
    }

}