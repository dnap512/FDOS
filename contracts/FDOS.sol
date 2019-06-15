pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract FDOS {
    
    mapping (address => uint256) public serialNumber;
    mapping (uint256 => address) public addressOfEatery;

    mapping (uint256 => string) public area1;
    mapping (uint256 => string) public area2;
    mapping (uint256 => string) public area3;
    mapping (uint256 => string) public area4;

    mapping (uint256 => uint8) public menuNum;
    mapping (uint256 => mapping (uint8 => string)) public menuName;
    mapping (uint256 => mapping (uint8 => uint32)) public menuCharge;
    mapping (uint256 => bool) public open;

    address public owner;
    uint256 public numberOfEatery;

    struct menuSet{
        string menuName;
        uint32 menuCharge;
    }




    constructor () public{
        owner = msg.sender;
        numberOfEatery = 1;
    }

    function registerEatery (string _area1, string _area2, string _area3, string _area4) public returns (bool success){
        serialNumber[msg.sender] = numberOfEatery;
        addressOfEatery[numberOfEatery] = msg.sender;

        area1[numberOfEatery] = _area1;
        area2[numberOfEatery] = _area2;
        area3[numberOfEatery] = _area3;
        area4[numberOfEatery] = _area4;

        menuNum[numberOfEatery] = 0;
        numberOfEatery = SafeMath.add(numberOfEatery , 1);
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

    function showEatery(string _area3, string _area4) public view returns(uint256[] serial){
        require(numberOfEatery > 0);
        uint256[] memory serials;
        uint256 n = 1;
        uint256 present = 0;
        while( n <= numberOfEatery ){
            if(keccak256(area3[n]) == keccak256(_area3)  && keccak256(area4[n]) == keccak256(_area4)){
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
            totalCharge = SafeMath.add(totalCharge, menuCharge[_serial][_menus[i]]);
        }

        if( totalCharge > msg.value){   // not enough value!
            return false;
        }
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