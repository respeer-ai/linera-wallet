![image](src/assets/CheCko.png)

### CheCko: Another broswer wallet for Linera blockchain by ResPeer

[![Test](https://github.com/respeer-ai/linera-wallet/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/respeer-ai/linera-wallet/actions/workflows/test.yml)

#### CheCko Wallet

In Linera design, the whole microchain will be run in browser extension. That's really a pretty cool idea that users do not need to depend on operators who run blockchain node to provide blockchain api service. But user won't run their brower extension forever. When they leave their computer, they will shutdown their browser. After they come back, they have to synchronize microchain data from validators again. With time flying, there will be more applications run on Linera, and the microchain data may grow day by day. The microchain data will be huge some day. As we know, large storage in browser may cause it crash and lose data. So, ResPeer has an idea to separate the wallet client and Linera Node Service.

#### Linera Node Service

Linera Node Service is actually the wallet system of Linera. It will hold keys of accounts, run microchains of the wallet, and will be run in browser extension in future. Microchain owner extend their microchain blocks by call operation to Node Service, then Node Service will pack operations into new blocks with incoming messages.

#### How it Works

We probably need to let Node Service not generate new blocks automatically, and let wallet client be able to get data to be signed to sign then submit to Node Servce for execution. The work flow is mainly as following

![image](src/assets/CheCkoArchitecture.png)

As the figure described, Linera Node Service won't store acount key and sign blocks anymore. Instread of that, it maintains a pending blocks list in which all of the blocks is constructed but not signed. When browser wallet client is launched, it'll subscribe to Node Service for new block notification. Of course, if the node service do not have a microchain for local account, it could create one with its public key, and keep private key in wallet client keystore locally.

#### About CheCko

Basically, CheCko is the wallet login system of ResPeer. But for a stable web3 application service, we think of it's deserved to have a microchain cluster to provide stable service for ResPeer user. So we create CheCko with such a `Microchain as a Service` architecture. And for Linera ecosystem, we think of other application can also use this architecture to simplify their application development.
