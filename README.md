# blindsig-client-server-example
Example of usage of [go-blindsecp256k1](https://github.com/arnaucube/go-blindsecp256k1) & [blindsecp256k1-js](https://github.com/arnaucube/blindsecp256k1-js), including a server representing the 'signer', and a web representing the 'user'.

## Run
- Needs [go](https://golang.org/) installed
- If wants to use the WASM web version:
	- Add the file `wasm_exec.js` in the `client` directory:
	```
	cd client
	cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
	```
- Run the server:
```
go run main.go
```
- Open the browser at `127.0.0.1:3000/web`
	- `/web/index.html` shows the js version
	- `/web/index-wasm.html` shows the WASM version

## Loop test
Check [loop-test](https://github.com/arnaucube/blindsig-client-server-example/blob/master/client/loop-test/README.md) for more details.

## Flow
![diagram](https://raw.githubusercontent.com/arnaucube/blindsig-client-server-example/master/diagram.png "diagram")
