const fs = require('fs')
const FDOS = artifacts.require('./FDOS.sol')

module.exports = function (deployer) {
  deployer.deploy(FDOS)
    .then(() =>{
        if(FDOS._json){
            fs.writeFile('deployedABI', JSON.stringify(FDOS._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 ABI 입력 성공");
                }
            )

            fs.writeFile('deployedAddress', FDOS.address,
                (err) => {
                    if (err) throw err;
                    console.log("파일에 주소 입력 성공");
                }
            )
        }
    })
}
