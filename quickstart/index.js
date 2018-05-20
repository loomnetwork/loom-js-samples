const {
  NonceTxMiddleware, SignedTxMiddleware, Client,
  Contract, Address, LocalAddress, CryptoUtils
} = require('loom-js')

const { MapEntry } = require('./helloworld_pb')
  
/**
 * Creates a new `Contract` instance that can be used to interact with a smart contract.
 * @param privateKey Private key that will be used to sign transactions sent to the contract.
 * @param publicKey Public key that corresponds to the private key.
 * @returns `Contract` instance.
 */
function getContract(privateKey, publicKey) {
  const client = new Client(
    'default',
    'ws://127.0.0.1:46657/websocket',
    'ws://127.0.0.1:9999/queryws'
  )
  // required middleware
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ]
  // address of the `helloworld` smart contract on the Loom DAppChain
  const contractAddr = new Address(
    client.chainId,
    LocalAddress.fromHexString('0x005B17864f3adbF53b1384F2E6f2120c6652F779')
  )
  const callerAddr = new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
  return new Contract({
    contractAddr,
    callerAddr,
    client
  })
}

/**
 * Stores an association between a key and a value in a smart contract.
 * @param contract Contract instance returned from `getContract()`.
 */
async function store(contract, key, value) {
  const params = new MapEntry()
  params.setKey(key)
  params.setValue(value)
  await contract.callAsync('SetMsg', params)
}

/**
 * Loads the value associated with a key in a smart contract.
 * @param contract Contract instance returned from `getContract()`.
 */
async function load(contract, key) {
  const params = new MapEntry()
  // The smart contract will look up the value stored under this key.
  params.setKey(key)
  const result = await contract.staticCallAsync('GetMsg', params, new MapEntry())
  console.log("weee------", result)
  console.log("weee2------", result.getValue())
  return result.getValue()
}


window.fireBlockchainEvents = async function () {
  const privateKey = CryptoUtils.generatePrivateKey()
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  
  const contract = getContract(privateKey, publicKey)
  await store(contract, '123', 'hello!')
  const value = await load(contract, '123')
  console.log('Value: ' + value)
}